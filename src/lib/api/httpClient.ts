import { getApiBaseUrl } from '@/lib/config';

import { ApiError, InvalidResponseError, NetworkError } from './errors';

const TIMEOUT_MS = 15_000;

export type HttpOptions = {
  method?: 'GET' | 'POST';
  body?: unknown;
  headers?: Record<string, string>;
  signal?: AbortSignal;
};

/**
 * Thin JSON transport: base URL, timeout and HTTP failures.
 * Knows nothing about authentication, sessions or specific endpoints.
 */
export async function httpClient(path: string, options: HttpOptions = {}): Promise<unknown> {
  const url = `${getApiBaseUrl()}${path}`;
  const controller = new AbortController();
  const abort = () => controller.abort();
  const timeout = setTimeout(abort, TIMEOUT_MS);
  if (options.signal?.aborted) abort();
  options.signal?.addEventListener('abort', abort);

  try {
    const response = await request(url, options, controller.signal);
    if (!response.ok) throw new ApiError(response.status);
    return await readJson(response);
  } finally {
    clearTimeout(timeout);
    options.signal?.removeEventListener('abort', abort);
  }
}

async function request(url: string, options: HttpOptions, signal: AbortSignal): Promise<Response> {
  const hasBody = options.body !== undefined;
  try {
    return await fetch(url, {
      method: options.method ?? 'GET',
      headers: {
        Accept: 'application/json',
        'Cache-Control': 'no-store',
        ...(hasBody ? { 'Content-Type': 'application/json' } : null),
        ...options.headers,
      },
      body: hasBody ? JSON.stringify(options.body) : undefined,
      credentials: 'omit',
      // A redirect could carry the Authorization header to another host.
      redirect: 'error',
      signal,
    });
  } catch {
    throw new NetworkError();
  }
}

async function readJson(response: Response): Promise<unknown> {
  let text: string;
  try {
    text = await response.text();
  } catch {
    throw new NetworkError();
  }
  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new InvalidResponseError();
  }
}
