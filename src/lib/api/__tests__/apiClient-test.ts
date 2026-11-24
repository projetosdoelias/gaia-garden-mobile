import { secureStoreData } from '@/testing/secureStoreMock';
import { API_URL, mockFetch } from '@/testing/http';
import { makeTokenExpiringIn } from '@/testing/jwt';

import { session } from '../../auth/session';
import { InvalidCredentialsError, signIn } from '../../auth/signIn';
import { ApiError, InvalidResponseError, NetworkError, SessionExpiredError } from '../errors';
import { habitatClient } from '../habitatClient';
import { queryClient, queryKeys } from '../queryClient';
import { telemetryClient } from '../telemetryClient';

jest.mock('expo-secure-store', () => jest.requireActual('@/testing/secureStoreMock'));

const reading = {
  id: 1,
  habitatId: 7,
  temperature: 25.4,
  humidity: 60,
  vpd: 1.1,
  recordedAt: '2026-11-23T12:00:00.000Z',
  createdAt: '2026-11-23T12:00:01.000Z',
};

beforeEach(async () => {
  process.env.EXPO_PUBLIC_API_URL = API_URL;
  await session.end(null);
  secureStoreData.clear();
});

afterEach(() => queryClient.clear());

async function openSession(token = makeTokenExpiringIn(600)) {
  session.activate(await session.open(token));
  return token;
}

describe('authenticated requests', () => {
  it('sends the Bearer token, without cookies or redirects', async () => {
    const token = await openSession();
    const fetchMock = mockFetch(() => ({ status: 200, body: [] }));

    await habitatClient.list();

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_URL}/habitat`,
      expect.objectContaining({
        credentials: 'omit',
        redirect: 'error',
        headers: expect.objectContaining({ Authorization: `Bearer ${token}` }),
      }),
    );
  });

  it('does not call the API without a session', async () => {
    const fetchMock = mockFetch(() => ({ status: 200, body: [] }));
    await expect(habitatClient.list()).rejects.toBeInstanceOf(SessionExpiredError);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('does not call the API with an expired token', async () => {
    await openSession();
    const fetchMock = mockFetch(() => ({ status: 200, body: [] }));
    const clock = jest.spyOn(Date, 'now').mockReturnValue(Date.now() + 3_600_000);

    await expect(habitatClient.list()).rejects.toBeInstanceOf(SessionExpiredError);
    clock.mockRestore();

    expect(fetchMock).not.toHaveBeenCalled();
    expect(session.getSnapshot()).toEqual({ status: 'guest', endReason: 'session_expired' });
  });

  it('rejects a response with an unexpected shape', async () => {
    await openSession();
    mockFetch(() => ({ status: 200, body: [{ id: 'x' }] }));
    await expect(habitatClient.list()).rejects.toBeInstanceOf(InvalidResponseError);
  });

  it('keeps the session on a network failure', async () => {
    await openSession();
    mockFetch(() => new TypeError('offline'));
    await expect(habitatClient.list()).rejects.toBeInstanceOf(NetworkError);
    expect(session.getSnapshot().status).toBe('authenticated');
  });
});

describe('401/403 interceptor', () => {
  it.each([401, 403])('clears the whole session on %i', async (status) => {
    await openSession();
    queryClient.setQueryData(queryKeys.profile, { userId: 1, username: 'ana' });
    mockFetch(() => ({ status }));

    await expect(habitatClient.list()).rejects.toBeInstanceOf(SessionExpiredError);

    expect(session.getSnapshot()).toEqual({ status: 'guest', endReason: 'session_expired' });
    expect(session.getCredentials()).toBeNull();
    expect(secureStoreData.size).toBe(0);
    expect(queryClient.getQueryData(queryKeys.profile)).toBeUndefined();
  });

  it('runs once for concurrent 401s', async () => {
    await openSession();
    mockFetch(() => ({ status: 401 }));
    const reset = jest.fn();
    const unsubscribe = session.onReset(reset);

    const results = await Promise.allSettled([1, 2, 3].map(() => habitatClient.list()));
    unsubscribe();

    expect(results.every(({ status }) => status === 'rejected')).toBe(true);
    expect(reset).toHaveBeenCalledTimes(1);
  });

  it.each([400, 404, 500])('keeps the session on %i', async (status) => {
    await openSession();
    mockFetch(() => ({ status }));
    await expect(habitatClient.list()).rejects.toEqual(new ApiError(status));
    expect(session.getSnapshot().status).toBe('authenticated');
  });
});

describe('telemetryClient.getLast', () => {
  it('returns the reading', async () => {
    await openSession();
    mockFetch(() => ({ status: 200, body: reading }));
    await expect(telemetryClient.getLast(7)).resolves.toEqual(reading);
  });

  it('maps 404 to null (no readings yet)', async () => {
    await openSession();
    mockFetch(() => ({ status: 404 }));
    await expect(telemetryClient.getLast(7)).resolves.toBeNull();
    expect(session.getSnapshot().status).toBe('authenticated');
  });

  it('does not hide other errors', async () => {
    await openSession();
    mockFetch(() => ({ status: 500 }));
    await expect(telemetryClient.getLast(7)).rejects.toBeInstanceOf(ApiError);
  });
});

describe('signIn', () => {
  const credentials = { username: 'ana', password: 'secret' };

  it('stores the session and loads the profile', async () => {
    const token = makeTokenExpiringIn(600);
    mockFetch((path) =>
      path === '/auth/login'
        ? { status: 200, body: { access_token: token } }
        : { status: 200, body: { userId: 1, username: 'ana', iat: 1, exp: 2 } },
    );

    await signIn(credentials);

    expect(session.getSnapshot().status).toBe('authenticated');
    expect([...secureStoreData.values()]).toEqual([token]);
    expect(queryClient.getQueryData(queryKeys.profile)).toEqual({ userId: 1, username: 'ana' });
  });

  it('never sends a userId', async () => {
    const fetchMock = mockFetch(() => ({ status: 401 }));
    await expect(signIn(credentials)).rejects.toBeInstanceOf(InvalidCredentialsError);
    expect(JSON.parse(String(fetchMock.mock.calls[0][1]?.body))).toEqual(credentials);
  });

  it.each([400, 401, 403, 404])('gives one generic error for %i', async (status) => {
    mockFetch(() => ({ status }));
    await expect(signIn(credentials)).rejects.toThrow('Invalid username or password.');
    // Bad credentials are not an expired session.
    expect(session.getSnapshot().endReason).toBeNull();
  });

  it('leaves no session behind when the profile fails', async () => {
    mockFetch((path) =>
      path === '/auth/login'
        ? { status: 200, body: { access_token: makeTokenExpiringIn(600) } }
        : { status: 500 },
    );

    await expect(signIn(credentials)).rejects.toBeInstanceOf(ApiError);
    expect(session.getSnapshot()).toEqual({ status: 'guest', endReason: null });
    expect(secureStoreData.size).toBe(0);
  });
});
