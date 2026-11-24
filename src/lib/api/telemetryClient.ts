import { telemetrySchema, type Telemetry } from '@/lib/schemas/telemetry';

import { apiClient } from './apiClient';
import { ApiError } from './errors';

export const telemetryClient = {
  /** The latest reading, or `null` when the habitat has none (the API answers 404). */
  async getLast(habitatId: number, signal?: AbortSignal): Promise<Telemetry | null> {
    try {
      return await apiClient(`/telemetry/${habitatId}/last`, telemetrySchema, { signal });
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) return null;
      throw error;
    }
  },
};
