import type { z } from 'zod';

import { InvalidResponseError } from './errors';

/** Validates an API response. Unknown fields are dropped by the schemas. */
export function parseResponse<T>(schema: z.ZodType<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) throw new InvalidResponseError();
  return result.data;
}
