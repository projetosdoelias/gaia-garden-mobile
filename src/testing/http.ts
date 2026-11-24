type Reply = { status: number; body?: unknown };

export const API_URL = 'https://api.test';

/** Replaces global fetch. `reply` gets the path and may return an error to simulate being offline. */
export function mockFetch(reply: (path: string) => Reply | Error) {
  const mock = jest.fn(async (input: RequestInfo | URL, _init?: RequestInit) => {
    const result = reply(String(input).replace(API_URL, ''));
    if (result instanceof Error) throw result;
    const { status, body = {} } = result;
    return {
      ok: status >= 200 && status < 300,
      status,
      text: async () => JSON.stringify(body),
    } as Response;
  });
  globalThis.fetch = mock as unknown as typeof fetch;
  return mock;
}
