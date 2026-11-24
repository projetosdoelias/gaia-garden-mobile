import { useState, type ComponentRef, type Ref } from 'react';
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { colors, gaia, radii, spacing, TOUCH_TARGET, typography } from '@/theme';

import { AppText } from './AppText';

type Props = Omit<TextInputProps, 'style'> & {
  label: string;
  error?: string;
  ref?: Ref<ComponentRef<typeof TextInput>>;
};

export function TextField({ label, error, ref, ...props }: Props) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.field}>
      <AppText variant="small" color={colors.textMuted}>
        {label}
      </AppText>
      <TextInput
        ref={ref}
        accessibilityLabel={label}
        placeholderTextColor={colors.textPlaceholder}
        selectionColor={gaia.greenDeep}
        {...props}
        onFocus={(event) => {
          setFocused(true);
          props.onFocus?.(event);
        }}
        onBlur={(event) => {
          setFocused(false);
          props.onBlur?.(event);
        }}
        style={[styles.input, focused && styles.focused, error !== undefined && styles.invalid]}
      />
      {error !== undefined && (
        <AppText variant="caption" color={colors.criticalText} accessibilityRole="alert">
          {error}
        </AppText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: spacing[1] },
  input: {
    ...typography.body,
    minHeight: TOUCH_TARGET,
    color: gaia.darkText,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: radii.xl,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
  },
  focused: { borderColor: gaia.greenMint },
  invalid: { borderColor: gaia.alert.critical },
});
