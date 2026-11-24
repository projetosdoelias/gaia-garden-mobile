import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { StyleSheet, View } from 'react-native';

import { colors, gaia, radii, spacing } from '@/theme';

import { AppText } from './AppText';
import { Card } from './Card';

type Props = {
  label: string;
  value: string;
  unit: string;
  icon: SymbolViewProps['name'];
  badge?: { label: string; text: string; bg: string };
};

export function MetricCard({ label, value, unit, icon, badge }: Props) {
  const status = badge ? `, ${badge.label}` : '';
  return (
    <Card accessible accessibilityLabel={`${label}: ${value} ${unit}${status}`} style={styles.card}>
      <View style={styles.row}>
        <AppText variant="label" color={colors.textMuted}>
          {label}
        </AppText>
        <SymbolView name={icon} size={22} tintColor={gaia.greenDeep} />
      </View>
      <View style={styles.row}>
        <View style={styles.value}>
          <AppText variant="metric" color={gaia.greenDeep}>
            {value}
          </AppText>
          <AppText variant="heading" color={colors.textMuted}>
            {unit}
          </AppText>
        </View>
        {badge && (
          <View style={[styles.badge, { backgroundColor: badge.bg }]}>
            <AppText variant="label" color={badge.text}>
              {badge.label}
            </AppText>
          </View>
        )}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing[3], padding: spacing[5] },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  value: { flexDirection: 'row', alignItems: 'baseline', gap: spacing[1] },
  badge: { borderRadius: radii.full, paddingHorizontal: spacing[3], paddingVertical: spacing[1] },
});
