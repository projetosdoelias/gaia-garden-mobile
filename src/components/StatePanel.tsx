import { StyleSheet } from 'react-native';

import { colors, gaia, spacing } from '@/theme';

import { AppText } from './AppText';
import { Button } from './Button';
import { Card } from './Card';

type Props = {
  title: string;
  message: string;
  onRetry?: () => void;
};

/** Empty and error states. */
export function StatePanel({ title, message, onRetry }: Props) {
  return (
    <Card style={styles.panel}>
      <AppText variant="heading" color={gaia.greenDeep} style={styles.center}>
        {title}
      </AppText>
      <AppText variant="small" color={colors.textMuted} style={styles.center}>
        {message}
      </AppText>
      {onRetry && <Button label="Retry" variant="secondary" onPress={onRetry} />}
    </Card>
  );
}

const styles = StyleSheet.create({
  panel: { alignItems: 'center', gap: spacing[3] },
  center: { textAlign: 'center' },
});
