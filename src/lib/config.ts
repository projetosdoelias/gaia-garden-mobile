/** The app is misconfigured. The message is safe to show: it never contains the URL. */
export class ConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigError';
  }
}

/** Hosts that reach the developer's own machine. `10.0.2.2` is the Android emulator's alias. */
const DEV_HTTP_HOSTS = new Set(['localhost', '127.0.0.1', '10.0.2.2']);

/** Validates the configured API URL: HTTPS only, plus HTTP to localhost in dev builds. */
export function resolveApiBaseUrl(raw: string | undefined, isDev: boolean): string {
  if (!raw?.trim()) throw new ConfigError('The API URL is not configured.');

  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    throw new ConfigError('The API URL is not valid.');
  }

  if (url.username || url.password) {
    throw new ConfigError('The API URL must not contain credentials.');
  }

  const isLocalHttp = url.protocol === 'http:' && DEV_HTTP_HOSTS.has(url.hostname);
  if (url.protocol !== 'https:' && !(isDev && isLocalHttp)) {
    throw new ConfigError('The API URL must use HTTPS.');
  }

  return `${url.protocol}//${url.host}${url.pathname}`.replace(/\/+$/, '');
}

export function getApiBaseUrl(): string {
  // Must be read with dot notation: Expo inlines EXPO_PUBLIC_* variables at build time.
  return resolveApiBaseUrl(process.env.EXPO_PUBLIC_API_URL, __DEV__);
}
