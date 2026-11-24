import { ConfigError, resolveApiBaseUrl } from '../config';

describe('resolveApiBaseUrl', () => {
  it.each([true, false])('accepts HTTPS (dev: %s)', (isDev) => {
    expect(resolveApiBaseUrl('https://api.example.com/', isDev)).toBe('https://api.example.com');
  });

  it('keeps the port and path', () => {
    expect(resolveApiBaseUrl('https://example.com:8443/v1/', false)).toBe(
      'https://example.com:8443/v1',
    );
  });

  it.each(['http://localhost:3000', 'http://127.0.0.1:3000', 'http://10.0.2.2:3000'])(
    'accepts %s in dev builds only',
    (url) => {
      expect(resolveApiBaseUrl(url, true)).toBe(url);
      expect(() => resolveApiBaseUrl(url, false)).toThrow(ConfigError);
    },
  );

  it.each([
    'http://192.168.0.10:3000',
    'http://api.example.com',
    'http://localhost.evil.com',
    'ftp://localhost',
    'https://user:pass@example.com',
    'not a url',
    '',
    undefined,
  ])('rejects %s even in dev builds', (url) => {
    expect(() => resolveApiBaseUrl(url, true)).toThrow(ConfigError);
  });
});
