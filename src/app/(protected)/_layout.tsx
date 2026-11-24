import { Tabs } from 'expo-router/js-tabs';
import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import type { ColorValue } from 'react-native';

import { Brand } from '@/components/Brand';
import { HabitatProvider } from '@/lib/context/HabitatContext';
import { UserProvider } from '@/lib/context/UserContext';
import { colors, gaia } from '@/theme';

function tabIcon(name: SymbolViewProps['name']) {
  return function TabIcon({ color, size }: { color: ColorValue; size: number }) {
    return <SymbolView name={name} size={size} tintColor={color} />;
  };
}

const dashboardIcon = tabIcon({ ios: 'gauge.medium', android: 'dashboard' });
const accountIcon = tabIcon({ ios: 'person.crop.circle', android: 'account_circle' });

/** The protected shell: header, tabs, and the user and habitat contexts. */
export default function ProtectedLayout() {
  return (
    <UserProvider>
      <HabitatProvider>
        <Tabs
          screenOptions={{
            headerTitle: () => <Brand />,
            headerTitleAlign: 'left',
            headerStyle: { backgroundColor: colors.surface },
            headerShadowVisible: true,
            sceneStyle: { backgroundColor: gaia.bg },
            tabBarStyle: { backgroundColor: gaia.greenDeep, borderTopWidth: 0 },
            tabBarActiveTintColor: gaia.greenMint,
            tabBarInactiveTintColor: colors.tabInactive,
          }}
        >
          <Tabs.Screen
            name="dashboard"
            options={{ title: 'Dashboard', tabBarIcon: dashboardIcon }}
          />
          <Tabs.Screen name="account" options={{ title: 'Account', tabBarIcon: accountIcon }} />
        </Tabs>
      </HabitatProvider>
    </UserProvider>
  );
}
