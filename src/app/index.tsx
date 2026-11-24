import { Redirect, router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText } from '@/components/AppText';
import { Brand, BrandMark } from '@/components/Brand';
import { Button } from '@/components/Button';
import { useSession } from '@/lib/auth/useSession';
import { colors, gaia, spacing } from '@/theme';

export default function HomeScreen() {
  const { endReason } = useSession();

  // The stored session had expired when the app started.
  if (endReason === 'session_expired') return <Redirect href="/login" />;

  return (
    <SafeAreaView style={styles.screen}>
      <Brand />
      <View style={styles.hero}>
        <BrandMark size={80} />
        <AppText
          variant="hero"
          color={gaia.greenDeep}
          accessibilityRole="header"
          style={styles.center}
        >
          Gaia Garden
        </AppText>
        <AppText color={colors.textMuted} style={styles.center}>
          Precision monitoring and data intelligence for your indoor habitats.
        </AppText>
      </View>
      <Button label="Sign in" onPress={() => router.push('/login')} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: gaia.bg, padding: spacing[6] },
  hero: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing[5] },
  center: { textAlign: 'center' },
});
