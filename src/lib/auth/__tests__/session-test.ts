import * as SecureStore from 'expo-secure-store';

import { secureStoreData } from '@/testing/secureStoreMock';
import { makeToken, makeTokenExpiringIn } from '@/testing/jwt';

import { createSession, InvalidTokenError } from '../session';

jest.mock('expo-secure-store', () => jest.requireActual('@/testing/secureStoreMock'));

const getItem = jest.mocked(SecureStore.getItemAsync);
const setItem = jest.mocked(SecureStore.setItemAsync);
const deleteItem = jest.mocked(SecureStore.deleteItemAsync);
const fetchMock = jest.fn();

beforeEach(() => {
  secureStoreData.clear();
  jest.clearAllMocks();
  globalThis.fetch = fetchMock as unknown as typeof fetch;
});

async function signedInSession() {
  const session = createSession();
  const token = makeTokenExpiringIn(600);
  session.activate(await session.open(token));
  return { session, token };
}

describe('save', () => {
  it('writes the token to secure storage, restricted to this unlocked device', async () => {
    const { session, token } = await signedInSession();

    expect(setItem).toHaveBeenCalledWith(expect.any(String), token, {
      keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });
    expect(session.getSnapshot()).toEqual({ status: 'authenticated', endReason: null });
    expect(session.getCredentials()?.token).toBe(token);
  });

  it('never exposes the token in the snapshot', async () => {
    const { session, token } = await signedInSession();
    expect(JSON.stringify(session.getSnapshot())).not.toContain(token);
  });

  it.each([
    ['expired', makeTokenExpiringIn(-1)],
    ['without exp', makeToken({ userId: 1 })],
    ['malformed', 'not-a-jwt'],
  ])('rejects a token that is %s without storing it', async (_, token) => {
    const session = createSession();
    await expect(session.open(token)).rejects.toBeInstanceOf(InvalidTokenError);
    expect(setItem).not.toHaveBeenCalled();
    expect(session.getCredentials()).toBeNull();
  });
});

describe('restore', () => {
  it('restores a stored token after a restart', async () => {
    const { token } = await signedInSession();

    const restarted = createSession();
    expect(restarted.getSnapshot().status).toBe('restoring');
    await restarted.restore();

    expect(restarted.getSnapshot().status).toBe('authenticated');
    expect(restarted.getCredentials()?.token).toBe(token);
  });

  it('becomes a guest when nothing is stored', async () => {
    const session = createSession();
    await session.restore();
    expect(session.getSnapshot()).toEqual({ status: 'guest', endReason: null });
  });

  it.each([
    ['expired', makeTokenExpiringIn(-1)],
    ['malformed', 'not-a-jwt'],
  ])('wipes a token that is %s, without calling the API', async (_, token) => {
    secureStoreData.set('gaia.session.token', token);
    const session = createSession();
    await session.restore();

    expect(session.getSnapshot()).toEqual({ status: 'guest', endReason: 'session_expired' });
    expect(secureStoreData.size).toBe(0);
    expect(session.getCredentials()).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('wipes the session when secure storage cannot be read', async () => {
    secureStoreData.set('gaia.session.token', makeTokenExpiringIn(600));
    getItem.mockRejectedValueOnce(new Error('keystore'));
    const session = createSession();
    await session.restore();

    expect(session.getSnapshot().status).toBe('guest');
    expect(secureStoreData.size).toBe(0);
  });
});

describe('clear', () => {
  it('removes the token from memory and storage and resets session data', async () => {
    const { session } = await signedInSession();
    const reset = jest.fn();
    session.onReset(reset);

    await expect(session.end('signed_out')).resolves.toBe(true);

    expect(session.getSnapshot()).toEqual({ status: 'guest', endReason: 'signed_out' });
    expect(session.getCredentials()).toBeNull();
    expect(secureStoreData.size).toBe(0);
    expect(reset).toHaveBeenCalledTimes(1);
  });

  it('ignores an end meant for an earlier session', async () => {
    const { session } = await signedInSession();
    const oldEpoch = session.getCredentials()!.epoch;
    const newToken = makeTokenExpiringIn(900);
    session.activate(await session.open(newToken));

    await session.end('session_expired', oldEpoch);

    expect(session.getSnapshot().status).toBe('authenticated');
    expect([...secureStoreData.values()]).toEqual([newToken]);
  });

  it('does not let a pending sign-out delete a newer token', async () => {
    const { session } = await signedInSession();
    const newToken = makeTokenExpiringIn(900);
    const ending = session.end('signed_out');
    const opening = session.open(newToken);
    await Promise.all([ending, opening]);

    expect([...secureStoreData.values()]).toEqual([newToken]);
  });

  it('overwrites the token when deletion fails', async () => {
    const { session, token } = await signedInSession();
    deleteItem.mockRejectedValueOnce(new Error('keystore'));

    await expect(session.end('signed_out')).resolves.toBe(true);
    expect([...secureStoreData.values()]).not.toContain(token);
  });

  it('reports when the token could not be removed', async () => {
    const { session } = await signedInSession();
    deleteItem.mockRejectedValueOnce(new Error('keystore'));
    setItem.mockRejectedValueOnce(new Error('keystore'));

    await expect(session.end('signed_out')).resolves.toBe(false);
    expect(session.getCredentials()).toBeNull();
  });
});

describe('expiry', () => {
  it('ends the session before a request when the token has expired', async () => {
    let now = Date.now();
    const session = createSession(() => now);
    session.activate(await session.open(makeTokenExpiringIn(60)));
    now += 61_000;

    expect(session.getCredentials()).toBeNull();
    expect(session.getSnapshot()).toEqual({ status: 'guest', endReason: 'session_expired' });
  });
});

describe('insecure storage', () => {
  it('fails instead of falling back when secure storage rejects the write', async () => {
    const webStorage = { getItem: jest.fn(), setItem: jest.fn(), removeItem: jest.fn() };
    Object.defineProperty(globalThis, 'localStorage', { value: webStorage, configurable: true });
    Object.defineProperty(globalThis, 'sessionStorage', { value: webStorage, configurable: true });
    setItem.mockRejectedValueOnce(new Error('keystore unavailable'));

    const session = createSession();
    await expect(session.open(makeTokenExpiringIn(600))).rejects.toThrow('keystore unavailable');

    expect(session.getCredentials()).toBeNull();
    expect(session.getSnapshot().status).not.toBe('authenticated');
    expect(webStorage.setItem).not.toHaveBeenCalled();
    expect(secureStoreData.size).toBe(0);
  });
});
