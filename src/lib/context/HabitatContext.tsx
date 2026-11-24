import { useQuery } from '@tanstack/react-query';
import { createContext, use, useState, type ReactNode } from 'react';

import { habitatClient } from '@/lib/api/habitatClient';
import { queryKeys } from '@/lib/api/queryClient';
import type { Habitat } from '@/lib/schemas/habitat';

type HabitatContextValue = {
  habitats: Habitat[];
  /** The user's choice, or the first habitat. `null` when there are none. */
  selectedHabitat: Habitat | null;
  selectHabitat: (id: number) => void;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
};

const HabitatContext = createContext<HabitatContextValue | null>(null);

export function HabitatProvider({ children }: { children: ReactNode }) {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const query = useQuery({
    queryKey: queryKeys.habitats,
    queryFn: ({ signal }) => habitatClient.list(signal),
  });

  const habitats = query.data ?? [];
  const selectedHabitat = habitats.find(({ id }) => id === selectedId) ?? habitats[0] ?? null;

  const value: HabitatContextValue = {
    habitats,
    selectedHabitat,
    selectHabitat: setSelectedId,
    isLoading: query.isPending,
    error: query.data ? null : query.error,
    refetch: async () => {
      await query.refetch();
    },
  };

  return <HabitatContext value={value}>{children}</HabitatContext>;
}

export function useHabitat(): HabitatContextValue {
  const value = use(HabitatContext);
  if (!value) throw new Error('useHabitat must be used within a HabitatProvider');
  return value;
}
