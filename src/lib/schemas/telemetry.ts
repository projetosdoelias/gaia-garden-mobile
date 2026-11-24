import { z } from 'zod';

export const telemetrySchema = z.object({
  id: z.number().int(),
  habitatId: z.number().int(),
  temperature: z.number(),
  humidity: z.number(),
  /** Calculated by the backend. Never computed here. */
  vpd: z.number(),
  recordedAt: z.string(),
  createdAt: z.string(),
});
export type Telemetry = z.infer<typeof telemetrySchema>;
