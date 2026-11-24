import type { z } from 'zod';

import { session } from '@/lib/auth/session';

import { ApiError, SessionExpiredError } from './errors';
import { httpClient, type HttpOptions } from './httpClient';
import { parseResponse } from './parse';

/**
 * The single entry point for authenticated calls.
 *
 * - No token, or an expired one: ends the session without calling the API.
 * - 401 or 403: ends the session. The route guards then send the user to Login.
 *
 * In every case above it throws `SessionExpiredError`.
 */
export async function apiClient<T>(
  path: string,
  schema: z.ZodType<T>,
  options?: Omit<HttpOptions, 'headers'>,
): Promise<T> {
  const credentials = session.getCredentials();
  if (!credentials) throw new SessionExpiredError();

  let data: unknown;
  try {
    data = await httpClient(path, {
      ...options,
      headers: { Authorization: `Bearer ${credentials.token}` },
    });
  } catch (error) {
    if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
      // Scoped to this request's session: a late 401 can't end a newer one.
      await session.end('session_expired', credentials.epoch);
      throw new SessionExpiredError();
    }
    throw error;
  }

  // The session ended while the request was in flight: drop its data.
  if (!session.isCurrent(credentials.epoch)) throw new SessionExpiredError();
  return parseResponse(schema, data);
}
