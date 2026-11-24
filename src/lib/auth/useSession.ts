import { useSyncExternalStore } from 'react';

import { session, type SessionSnapshot } from './session';

export function useSession(): SessionSnapshot {
  return useSyncExternalStore(session.subscribe, session.getSnapshot);
}
