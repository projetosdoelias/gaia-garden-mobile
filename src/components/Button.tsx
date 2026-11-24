import { ActivityIndicator, Pressable, StyleSheet, type PressableProps } from 'react-native';

import { colors, gaia, radii, shadows, spacing, TOUCH_TARGET } from '@/theme';

import { AppText } from './AppText';

type Props = Omit<PressableProps, 'children' | 'style'> & {
  label: string;
  variant?: 'primary' | 'secondary';
  loading?: boolean;
  loadingLabel?: string;
};

export function Button({
  label,
  variant = 'primary',
  loading = false,
  loadingLabel,
  disabled,
  ...props
}: Props) {
  const isDisabled = disabled || loading;
  const textColor = variant === 'primary' ? colors.onPrimary : gaia.greenDeep;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: Boolean(isDisabled), busy: loading }}
      {...props}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        variant === 'primary' ? styles.primary : styles.secondary,
        pressed && styles.pressed,
        isDisabled && styles.disabled,
      ]}
    >
      {loading && (
        <ActivityIndicator color={variant === 'primary' ? gaia.greenMint : gaia.greenDeep} />
      )}
      <AppText variant="bodyStrong" color={textColor}>
        {loading && loadingLabel ? loadingLabel : label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: TOUCH_TARGET,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[3],
    borderRadius: radii.xl,
    ...shadows.sm,
  },
  primary: { backgroundColor: gaia.greenDeep },
  secondary: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  pressed: { opacity: 0.85 },
  disabled: { opacity: 0.6 },
});
