import { decodeJwtExp } from './jwt';
import { tokenStorage } from './tokenStorage';

export type SessionStatus = 'restoring' | 'guest' | 'authenticated';
export type SessionEndReason = 'session_expired' | 'signed_out';

/** What the UI can see. It never contains the token. */
export type SessionSnapshot = {
  readonly status: SessionStatus;
  readonly endReason: SessionEndReason | null;
};

/** `epoch` identifies the session a request was made for. */
export type SessionCredentials = { readonly token: string; readonly epoch: number };

export class InvalidTokenError extends Error {
  constructor() {
    super('The API returned an invalid token');
    this.name = 'InvalidTokenError';
  }
}

/**
 * Owns the session. The token lives only here (memory) and in secure storage.
 * Created through a factory so tests get isolated instances.
 */
export function createSession(now: () => number = () => Date.now()) {
  let snapshot: SessionSnapshot = { status: 'restoring', endReason: null };
  let token: string | null = null;
  let expiresAt = 0;
  let epoch = 0;
  /** Storage operations run in order, so a sign-out can't delete a newer token. */
  let storageQueue: Promise<unknown> = Promise.resolve();
  const listeners = new Set<() => void>();
  const resetHandlers = new Set<() => void>();

  function setSnapshot(next: SessionSnapshot) {
    if (next.status === snapshot.status && next.endReason === snapshot.endReason) return;
    snapshot = next;
    listeners.forEach((listener) => listener());
  }

  function enqueue<T>(operation: () => Promise<T>): Promise<T> {
    const result = storageQueue.then(operation, operation);
    storageQueue = result.catch(() => undefined);
    return result;
  }

  function forget() {
    token = null;
    expiresAt = 0;
    epoch += 1;
  }

  function readExpiry(candidate: string): number | null {
    const exp = decodeJwtExp(candidate);
    return exp !== null && exp > now() ? exp : null;
  }

  /**
   * Clears everything that belongs to the session: memory, cached data and secure storage.
   * With `forEpoch`, does nothing unless that session is still the current one, so concurrent
   * 401s run it once. Resolves to whether the stored token was removed.
   */
  async function end(reason: SessionEndReason | null, forEpoch?: number): Promise<boolean> {
    if (forEpoch !== undefined && forEpoch !== epoch) return true;
    forget();
    setSnapshot({ status: 'guest', endReason: reason });
    resetHandlers.forEach((reset) => reset());
    try {
      await enqueue(() => tokenStorage.clear());
      return true;
    } catch {
      return false;
    }
  }

  return {
    getSnapshot: (): SessionSnapshot => snapshot,

    subscribe(listener: () => void): () => void {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },

    /** Registers cleanup of per-session data (e.g. the query cache). */
    onReset(handler: () => void): () => void {
      resetHandlers.add(handler);
      return () => {
        resetHandlers.delete(handler);
      };
    },

    /** Runs once at startup. Never calls the API. */
    async restore(): Promise<void> {
      let stored: string | null;
      try {
        stored = await enqueue(() => tokenStorage.read());
      } catch {
        await end(null);
        return;
      }
      if (!stored) {
        setSnapshot({ status: 'guest', endReason: null });
        return;
      }
      const exp = readExpiry(stored);
      if (exp === null) {
        await end('session_expired');
        return;
      }
      token = stored;
      expiresAt = exp;
      epoch += 1;
      setSnapshot({ status: 'authenticated', endReason: null });
    },

    /**
     * Stores a new token. Requests can use it right away, but the user only counts as signed in
     * after `activate`. Throws when the token is unusable or can't be stored securely.
     */
    async open(newToken: string): Promise<number> {
      const exp = readExpiry(newToken);
      if (exp === null) throw new InvalidTokenError();
      forget();
      const openedEpoch = epoch;
      resetHandlers.forEach((reset) => reset());
      await enqueue(() => tokenStorage.write(newToken));
      if (openedEpoch !== epoch) throw new InvalidTokenError();
      token = newToken;
      expiresAt = exp;
      return openedEpoch;
    },

    /** Marks the opened session as signed in. */
    activate(openedEpoch: number): void {
      if (openedEpoch !== epoch || token === null) return;
      setSnapshot({ status: 'authenticated', endReason: null });
    },

    /** The token for one request. Ends the session when it has expired. */
    getCredentials(): SessionCredentials | null {
      if (token === null) return null;
      if (expiresAt <= now()) {
        void end('session_expired');
        return null;
      }
      return { token, epoch };
    },

    isCurrent: (forEpoch: number): boolean => forEpoch === epoch && token !== null,

    /** Ends the session if the token expired while the app was in the background. */
    checkExpiry(): void {
      if (token !== null && expiresAt <= now()) void end('session_expired');
    },

    /** The user has seen why the session ended. */
    dismissEndReason(): void {
      setSnapshot({ ...snapshot, endReason: null });
    },

    end,

    /** Test-only: back to the state of a cold start. Leaves secure storage alone. */
    __resetForTests(): void {
      forget();
      setSnapshot({ status: 'restoring', endReason: null });
    },
  };
}

export type Session = ReturnType<typeof createSession>;

export const session = createSession();
