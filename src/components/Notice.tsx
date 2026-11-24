import { StyleSheet, View } from 'react-native';

import { colors, radii, spacing } from '@/theme';

import { AppText } from './AppText';

const TONES = {
  critical: {
    text: colors.criticalText,
    backgroundColor: colors.criticalBg,
    borderColor: colors.criticalBorder,
  },
  warning: {
    text: colors.warningText,
    backgroundColor: colors.warningBg,
    borderColor: colors.warningBorder,
  },
} as const;

/** Inline message, announced by screen readers. */
export function Notice({ tone, message }: { tone: keyof typeof TONES; message: string }) {
  const { text, ...box } = TONES[tone];
  return (
    <View accessibilityRole="alert" accessibilityLiveRegion="polite" style={[styles.notice, box]}>
      <AppText variant="small" color={text}>
        {message}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  notice: {
    borderWidth: 1,
    borderRadius: radii.xl,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
  },
});
