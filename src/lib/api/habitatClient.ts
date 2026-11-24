import { habitatListSchema, type Habitat } from '@/lib/schemas/habitat';

import { apiClient } from './apiClient';

export const habitatClient = {
  /** The user's habitats. Ownership comes from the token. */
  list(signal?: AbortSignal): Promise<Habitat[]> {
    return apiClient('/habitat', habitatListSchema, { signal });
  },
};
