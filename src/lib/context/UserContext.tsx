import { useQuery } from '@tanstack/react-query';
import { createContext, use, type ReactNode } from 'react';

import { authClient } from '@/lib/api/authClient';
import { queryKeys } from '@/lib/api/queryClient';
import { session } from '@/lib/auth/session';
import type { UserProfile } from '@/lib/schemas/auth';

type UserContextValue = {
  user: UserProfile | null;
  isLoading: boolean;
  /** Resolves to whether the stored session was removed from the device. */
  signOut: () => Promise<boolean>;
};

const UserContext = createContext<UserContextValue | null>(null);

const signOut = () => session.end('signed_out');

export function UserProvider({ children }: { children: ReactNode }) {
  const { data, isPending } = useQuery({
    queryKey: queryKeys.profile,
    queryFn: ({ signal }) => authClient.profile(signal),
    staleTime: Infinity,
  });

  return (
    <UserContext value={{ user: data ?? null, isLoading: isPending, signOut }}>
      {children}
    </UserContext>
  );
}

export function useUser(): UserContextValue {
  const value = use(UserContext);
  if (!value) throw new Error('useUser must be used within a UserProvider');
  return value;
}
