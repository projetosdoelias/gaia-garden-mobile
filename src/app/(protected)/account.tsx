import { Alert, ScrollView, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { useUser } from '@/lib/context/UserContext';
import { colors, gaia, radii, spacing } from '@/theme';

export default function AccountScreen() {
  const { user, isLoading, signOut } = useUser();
  const name = user?.username ?? (isLoading ? 'Loading…' : 'Profile unavailable');

  async function handleSignOut() {
    const removed = await signOut();
    if (!removed) {
      Alert.alert(
        'Sign out incomplete',
        'The saved session could not be removed from this device. Sign in and sign out again.',
      );
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <AppText variant="title" color={gaia.greenDeep} accessibilityRole="header">
        Account
      </AppText>
      <Card style={styles.card}>
        <View style={styles.avatar}>
          <AppText variant="heading" color={gaia.greenDeep}>
            {user?.username.charAt(0).toUpperCase() ?? '·'}
          </AppText>
        </View>
        <View style={styles.identity}>
          <AppText variant="label" color={colors.textMuted}>
            Signed in as
          </AppText>
          <AppText variant="bodyStrong" numberOfLines={1}>
            {name}
          </AppText>
        </View>
      </Card>
      <Button label="Sign out" variant="secondary" onPress={handleSignOut} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing[4], gap: spacing[4] },
  card: { flexDirection: 'row', alignItems: 'center', gap: spacing[4] },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: radii.full,
    backgroundColor: colors.avatar,
    alignItems: 'center',
    justifyContent: 'center',
  },
  identity: { flex: 1 },
});
