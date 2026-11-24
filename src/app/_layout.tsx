import '@/lib/silenceLogs';

import { focusManager, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { AppState } from 'react-native';

import { queryClient } from '@/lib/api/queryClient';
import { session } from '@/lib/auth/session';
import { useSession } from '@/lib/auth/useSession';
import { gaia } from '@/theme';

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { status } = useSession();
  const isRestoring = status === 'restoring';

  useEffect(() => {
    void session.restore();
  }, []);

  useEffect(() => {
    if (!isRestoring) SplashScreen.hide();
  }, [isRestoring]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') session.checkExpiry();
      focusManager.setFocused(state === 'active');
    });
    return () => subscription.remove();
  }, []);

  // The native splash covers the app until the session check finishes.
  if (isRestoring) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: gaia.bg } }}>
        <Stack.Protected guard={status === 'guest'} redirectTo="/dashboard">
          <Stack.Screen name="index" />
          <Stack.Screen name="login" />
        </Stack.Protected>
        <Stack.Protected guard={status === 'authenticated'} redirectTo="/login">
          <Stack.Screen name="(protected)" />
        </Stack.Protected>
      </Stack>
    </QueryClientProvider>
  );
}
