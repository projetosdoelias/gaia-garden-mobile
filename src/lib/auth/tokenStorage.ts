import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'gaia.session.token';

/** Readable only while the device is unlocked, and never migrated to another device. */
const OPTIONS: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};

/**
 * The only access to the persisted token (iOS Keychain / Android Keystore).
 * There is no fallback: when secure storage fails, the error reaches the caller.
 */
export const tokenStorage = {
  read(): Promise<string | null> {
    return SecureStore.getItemAsync(TOKEN_KEY, OPTIONS);
  },

  write(token: string): Promise<void> {
    return SecureStore.setItemAsync(TOKEN_KEY, token, OPTIONS);
  },

  async clear(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEY, OPTIONS);
    } catch {
      // Deletion failed: overwrite the value so the token itself is gone.
      await SecureStore.setItemAsync(TOKEN_KEY, '', OPTIONS);
    }
  },
};
