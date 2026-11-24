import { ConfigError } from '@/lib/config';

/** Non-2xx response. Keeps only the status: response bodies are untrusted and never shown. */
export class ApiError extends Error {
  constructor(public readonly status: number) {
    super(`Request failed (${status})`);
    this.name = 'ApiError';
  }
}

/** The request never got a response (offline, timeout, TLS failure). */
export class NetworkError extends Error {
  constructor() {
    super('Network request failed');
    this.name = 'NetworkError';
  }
}

/** The API answered with a shape the app does not understand. */
export class InvalidResponseError extends Error {
  constructor() {
    super('Unexpected response from the API');
    this.name = 'InvalidResponseError';
  }
}

/** There is no valid session. The session is already cleared when this is thrown. */
export class SessionExpiredError extends Error {
  constructor() {
    super('Your session has expired.');
    this.name = 'SessionExpiredError';
  }
}

/** User-facing copy for a failed request. Never includes text sent by the server. */
export function toUserMessage(error: unknown): string {
  if (error instanceof ConfigError || error instanceof SessionExpiredError) return error.message;
  if (error instanceof NetworkError) {
    return "Can't reach the server. Check your connection and try again.";
  }
  return 'Something went wrong. Please try again.';
}
