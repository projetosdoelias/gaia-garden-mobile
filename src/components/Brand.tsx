import { StyleSheet, View } from 'react-native';

import { gaia, radii, spacing } from '@/theme';

import { AppText } from './AppText';

/** The logo mark: a green square with a mint ring and dot. */
export function BrandMark({ size = 40 }: { size?: number }) {
  const ring = size * 0.4;
  const dot = size * 0.1;
  return (
    <View
      accessible={false}
      style={[styles.mark, { width: size, height: size, borderRadius: size * 0.28 }]}
    >
      <View
        style={[
          styles.ring,
          { width: ring, height: ring, borderRadius: ring / 2, borderWidth: size * 0.05 },
        ]}
      >
        <View style={[styles.dot, { width: dot, height: dot, borderRadius: dot / 2 }]} />
      </View>
    </View>
  );
}

/** Logo mark plus the app name. */
export function Brand() {
  return (
    <View style={styles.row} accessible accessibilityLabel="Gaia Garden">
      <BrandMark size={36} />
      <View>
        <AppText variant="heading" color={gaia.greenDeep} style={styles.name}>
          Gaia
        </AppText>
        <AppText variant="label" color={gaia.greenDeep} style={styles.suffix}>
          Garden
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mark: { backgroundColor: gaia.greenDeep, alignItems: 'center', justifyContent: 'center' },
  ring: { borderColor: gaia.greenMint, alignItems: 'center', justifyContent: 'center' },
  dot: { backgroundColor: gaia.greenMint, borderRadius: radii.full },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing[3] },
  name: { lineHeight: 20 },
  suffix: { opacity: 0.7 },
});
