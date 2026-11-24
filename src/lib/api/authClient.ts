import {
  loginResponseSchema,
  profileSchema,
  type LoginCredentials,
  type UserProfile,
} from '@/lib/schemas/auth';

import { apiClient } from './apiClient';
import { httpClient } from './httpClient';
import { parseResponse } from './parse';

export const authClient = {
  /** Uses the plain transport: a 401 here means bad credentials, not an expired session. */
  async login({ username, password }: LoginCredentials): Promise<string> {
    const data = await httpClient('/auth/login', {
      method: 'POST',
      body: { username, password },
    });
    return parseResponse(loginResponseSchema, data).access_token;
  },

  profile(signal?: AbortSignal): Promise<UserProfile> {
    return apiClient('/auth/profile', profileSchema, { signal });
  },
};
