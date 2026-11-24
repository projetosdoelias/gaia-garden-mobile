const { defineConfig, globalIgnores } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  globalIgnores(['dist/*', 'example/*', '.expo/*', 'ios/*', 'android/*']),
  expoConfig,
  {
    rules: {
      // Nothing may reach the device logs by accident (tokens, credentials, API data).
      'no-console': 'error',
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'expo-secure-store',
              message: 'Only src/lib/auth/tokenStorage.ts may access secure storage.',
            },
            {
              name: '@react-native-async-storage/async-storage',
              message: 'AsyncStorage is not encrypted. Session data must not be stored there.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/lib/auth/tokenStorage.ts', '**/__tests__/**'],
    rules: { 'no-restricted-imports': 'off' },
  },
]);
