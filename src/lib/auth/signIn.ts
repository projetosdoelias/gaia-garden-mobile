import { authClient } from '@/lib/api/authClient';
import { ApiError, toUserMessage } from '@/lib/api/errors';
import { queryClient, queryKeys } from '@/lib/api/queryClient';
import type { LoginCredentials } from '@/lib/schemas/auth';

import { session } from './session';

/** The credentials were rejected. Same copy for every cause: never reveals if a user exists. */
export class InvalidCredentialsError extends Error {
  constructor() {
    super('Invalid username or password.');
    this.name = 'InvalidCredentialsError';
  }
}

async function requestToken(credentials: LoginCredentials): Promise<string> {
  try {
    return await authClient.login(credentials);
  } catch (error) {
    if (error instanceof ApiError && [400, 401, 403, 404].includes(error.status)) {
      throw new InvalidCredentialsError();
    }
    throw error;
  }
}

/** Signs in, stores the session and loads the profile. Any failure leaves no session behind. */
export async function signIn(credentials: LoginCredentials): Promise<void> {
  const token = await requestToken(credentials);
  try {
    const epoch = await session.open(token);
    const profile = await authClient.profile();
    queryClient.setQueryData(queryKeys.profile, profile);
    session.activate(epoch);
  } catch (error) {
    await session.end(null);
    throw error;
  }
}

export function signInErrorMessage(error: unknown): string {
  return error instanceof InvalidCredentialsError ? error.message : toUserMessage(error);
}
