import { act, fireEvent, renderRouter, screen, waitFor } from 'expo-router/testing-library';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import * as SplashScreen from 'expo-splash-screen';

import ProtectedLayout from '@/app/(protected)/_layout';
import AccountScreen from '@/app/(protected)/account';
import DashboardScreen from '@/app/(protected)/dashboard';
import RootLayout from '@/app/_layout';
import HomeScreen from '@/app/index';
import LoginScreen from '@/app/login';
import { queryClient } from '@/lib/api/queryClient';
import { session } from '@/lib/auth/session';
import { API_URL, mockFetch } from '@/testing/http';
import { makeTokenExpiringIn } from '@/testing/jwt';
import { secureStoreData } from '@/testing/secureStoreMock';

jest.mock('expo-secure-store', () => jest.requireActual('@/testing/secureStoreMock'));
jest.mock('expo-symbols', () => ({ SymbolView: () => null }));
jest.mock('expo-splash-screen', () => ({
  preventAutoHideAsync: jest.fn(async () => true),
  hide: jest.fn(),
}));

const TOKEN_KEY = 'gaia.session.token';
const habitats = [7, 8].map((id) => ({
  id,
  title: `Habitat ${id}`,
  description: null,
  userId: 1,
  createdAt: '2026-11-01T00:00:00.000Z',
  updatedAt: '2026-11-01T00:00:00.000Z',
}));
const reading = {
  id: 1,
  habitatId: 7,
  temperature: 25.44,
  humidity: 60.2,
  vpd: 1.1,
  recordedAt: '2026-11-23T12:00:00.000Z',
  createdAt: '2026-11-23T12:00:01.000Z',
};

type Reply = { status: number; body?: unknown };

/** A working API; `overrides` replaces single routes. */
function mockApi(overrides: Record<string, Reply> = {}) {
  const routes: Record<string, Reply> = {
    '/auth/login': { status: 200, body: { access_token: makeTokenExpiringIn(600) } },
    '/auth/profile': { status: 200, body: { userId: 1, username: 'ana' } },
    '/habitat': { status: 200, body: habitats },
    '/telemetry/7/last': { status: 200, body: reading },
    '/telemetry/8/last': { status: 404 },
    ...overrides,
  };
  return mockFetch((path) => routes[path] ?? { status: 500 });
}

async function renderApp(initialUrl = '/') {
  await renderRouter(
    {
      _layout: RootLayout,
      index: HomeScreen,
      login: LoginScreen,
      '(protected)/_layout': ProtectedLayout,
      '(protected)/dashboard': DashboardScreen,
      '(protected)/account': AccountScreen,
    },
    { initialUrl },
  );
}

const signedIn = () => secureStoreData.set(TOKEN_KEY, makeTokenExpiringIn(600));

beforeEach(async () => {
  process.env.EXPO_PUBLIC_API_URL = API_URL;
  await session.end(null);
  secureStoreData.clear();
  session.__resetForTests();
  jest.clearAllMocks();
});

afterEach(() => queryClient.clear());

describe('startup', () => {
  it('renders nothing until the session check finishes', async () => {
    const fetchMock = mockApi();
    let finishRead: (token: string | null) => void = () => {};
    jest.mocked(SecureStore.getItemAsync).mockReturnValueOnce(
      new Promise((resolve) => {
        finishRead = resolve;
      }),
    );
    await renderApp('/dashboard');

    expect(screen.queryAllByText(/./)).toHaveLength(0);
    expect(SplashScreen.hide).not.toHaveBeenCalled();

    await act(async () => finishRead(null));
    await waitFor(() => expect(screen).toHavePathname('/login'));
    expect(SplashScreen.hide).toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe('without a session', () => {
  it('shows Home, and Sign in opens Login', async () => {
    const fetchMock = mockApi();
    await renderApp();
    await fireEvent.press(await screen.findByRole('button', { name: 'Sign in' }));
    expect(await screen.findByText('Sign in to your account')).toBeTruthy();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it.each(['/dashboard', '/account'])('redirects %s to Login without calling the API', async (url) => {
    const fetchMock = mockApi();
    await renderApp(url);
    await waitFor(() => expect(screen).toHavePathname('/login'));
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('sends an expired stored session to Login without calling the API', async () => {
    const fetchMock = mockApi();
    secureStoreData.set(TOKEN_KEY, makeTokenExpiringIn(-1));
    await renderApp();
    await waitFor(() => expect(screen).toHavePathname('/login'));
    expect(await screen.findByText(/session has expired/)).toBeTruthy();
    expect(secureStoreData.size).toBe(0);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe('login', () => {
  async function submit(username: string, password: string) {
    await fireEvent.changeText(await screen.findByLabelText('Username'), username);
    await fireEvent.changeText(screen.getByLabelText('Password'), password);
    await fireEvent.press(screen.getByRole('button', { name: 'Sign in' }));
  }

  it('goes to the Dashboard with valid credentials', async () => {
    mockApi();
    await renderApp('/login');
    await submit('ana', 'secret');
    await waitFor(() => expect(screen).toHavePathname('/dashboard'));
  });

  it('shows a generic error and forgets the password with invalid credentials', async () => {
    mockApi({ '/auth/login': { status: 401 } });
    await renderApp('/login');
    await submit('ana', 'wrong');
    expect(await screen.findByText('Invalid username or password.')).toBeTruthy();
    expect(screen.getByLabelText('Password').props.value).toBe('');
    expect(screen).toHavePathname('/login');
  });

  it('validates the form before calling the API', async () => {
    const fetchMock = mockApi();
    await renderApp('/login');
    await submit('  ', '');
    expect(await screen.findByText('Username is required')).toBeTruthy();
    expect(screen.getByText('Password is required')).toBeTruthy();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('masks the password and disables text correction', async () => {
    mockApi();
    await renderApp('/login');
    expect((await screen.findByLabelText('Password')).props).toMatchObject({
      secureTextEntry: true,
      autoCorrect: false,
      autoCapitalize: 'none',
    });
  });
});

describe('with a session', () => {
  it.each(['/', '/login'])('opens the Dashboard instead of %s', async (url) => {
    mockApi();
    signedIn();
    await renderApp(url);
    await waitFor(() => expect(screen).toHavePathname('/dashboard'));
  });

  it('selects the first habitat and shows its latest reading', async () => {
    mockApi();
    signedIn();
    await renderApp('/dashboard');
    expect(await screen.findByLabelText('Temperature: 25.4 °C')).toBeTruthy();
    expect(screen.getByLabelText('Humidity: 60 %')).toBeTruthy();
    expect(screen.getByLabelText('VPD: 1.10 kPa, Ideal')).toBeTruthy();
    expect(screen.getByLabelText('Habitat: Habitat 7')).toBeTruthy();
    expect(screen.getByText(/Recorded at Nov 23/)).toBeTruthy();
  });

  it('switches habitat, and shows the empty state when it has no readings', async () => {
    mockApi();
    signedIn();
    await renderApp('/dashboard');
    await fireEvent.press(await screen.findByLabelText('Habitat: Habitat 7'));
    await fireEvent.press(await screen.findByRole('radio', { name: 'Habitat 8' }));
    expect(await screen.findByText('No readings yet')).toBeTruthy();
  });

  it('handles a user without habitats', async () => {
    mockApi({ '/habitat': { status: 200, body: [] } });
    signedIn();
    await renderApp('/dashboard');
    expect(await screen.findByText('No habitats yet')).toBeTruthy();
  });

  it('shows an error and recovers with Retry', async () => {
    mockApi({ '/telemetry/7/last': { status: 400 } });
    signedIn();
    await renderApp('/dashboard');
    expect(await screen.findByText("Couldn't load telemetry")).toBeTruthy();
    mockApi();
    await fireEvent.press(screen.getByRole('button', { name: 'Retry' }));
    expect(await screen.findByLabelText('Temperature: 25.4 °C')).toBeTruthy();
  });
});

describe('end of the session', () => {
  it.each([401, 403])('a %i lands on Login and back cannot return', async (status) => {
    mockApi({ '/telemetry/7/last': { status } });
    signedIn();
    await renderApp('/dashboard');
    await waitFor(() => expect(screen).toHavePathname('/login'));
    expect(await screen.findByText(/session has expired/)).toBeTruthy();
    expect(secureStoreData.size).toBe(0);

    if (router.canGoBack()) await act(async () => router.back());
    expect(screen).not.toHavePathname('/dashboard');
    expect(screen).not.toHavePathname('/account');
    expect(screen.queryByText('Environmental telemetry')).toBeNull();
  });

  it('signing out clears everything and back cannot return', async () => {
    mockApi();
    signedIn();
    await renderApp('/account');
    expect(await screen.findByText('ana')).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Sign out' }));
    await waitFor(() => expect(screen).toHavePathname('/login'));

    expect(secureStoreData.size).toBe(0);
    expect(queryClient.getQueryCache().getAll()).toHaveLength(0);

    if (router.canGoBack()) await act(async () => router.back());
    expect(screen).not.toHavePathname('/dashboard');
    expect(screen).not.toHavePathname('/account');
  });

  it('a protected link opened afterwards still goes to Login', async () => {
    mockApi({ '/habitat': { status: 401 } });
    signedIn();
    await renderApp('/dashboard');
    await waitFor(() => expect(screen).toHavePathname('/login'));
    await act(async () => router.push('/dashboard'));
    await waitFor(() => expect(screen).toHavePathname('/login'));
  });
});
