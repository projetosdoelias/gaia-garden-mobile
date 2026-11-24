import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string().trim().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});
export type LoginCredentials = z.infer<typeof loginSchema>;

export const loginResponseSchema = z.object({ access_token: z.string().min(1) });

/** The API returns the JWT payload; only these two fields are used. */
export const profileSchema = z.object({
  userId: z.number().int(),
  username: z.string(),
});
export type UserProfile = z.infer<typeof profileSchema>;
