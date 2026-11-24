import { QueryClient } from '@tanstack/react-query';

import { session } from '@/lib/auth/session';

import { ApiError, NetworkError } from './errors';

function isTransient(error: unknown): boolean {
  return error instanceof NetworkError || (error instanceof ApiError && error.status >= 500);
}

/** In memory only: API responses are never persisted on the device. */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: (failureCount, error) => failureCount < 1 && isTransient(error),
    },
  },
});

// Nothing cached for one session may be visible in another.
session.onReset(() => queryClient.clear());

export const queryKeys = {
  profile: ['profile'] as const,
  habitats: ['habitats'] as const,
  lastTelemetry: (habitatId: number | null) => ['telemetry', habitatId, 'last'] as const,
};
