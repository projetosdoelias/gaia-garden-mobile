import { Text, type TextProps } from 'react-native';

import { gaia, typography } from '@/theme';

type Props = TextProps & {
  variant?: keyof typeof typography;
  color?: string;
};

export function AppText({ variant = 'body', color = gaia.darkText, style, ...props }: Props) {
  return <Text {...props} style={[typography[variant], { color }, style]} />;
}
