import { z } from 'zod';

export const habitatSchema = z.object({
  id: z.number().int(),
  title: z.string(),
  description: z.string().nullable(),
  userId: z.number().int(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Habitat = z.infer<typeof habitatSchema>;

export const habitatListSchema = z.array(habitatSchema);
