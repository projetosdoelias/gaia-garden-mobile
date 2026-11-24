/** In-memory stand-in for expo-secure-store. Use as a `jest.mock` factory result. */
export const secureStoreData = new Map<string, string>();

export const WHEN_UNLOCKED_THIS_DEVICE_ONLY = 1;
export const getItemAsync = jest.fn(async (key: string) => secureStoreData.get(key) ?? null);
export const setItemAsync = jest.fn(async (key: string, value: string) => {
  secureStoreData.set(key, value);
});
export const deleteItemAsync = jest.fn(async (key: string) => {
  secureStoreData.delete(key);
});
