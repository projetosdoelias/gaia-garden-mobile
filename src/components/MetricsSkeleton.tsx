import { useEffect, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

import { colors, radii, spacing } from '@/theme';

/** Loading placeholder with the layout of the three metric cards. */
export function MetricsSkeleton() {
  const [opacity] = useState(() => new Animated.Value(1));

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.5, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [opacity]);

  return (
    <View
      accessible
      accessibilityLabel="Loading"
      accessibilityState={{ busy: true }}
      style={styles.list}
    >
      {[0, 1, 2].map((key) => (
        <Animated.View key={key} style={[styles.block, { opacity }]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: spacing[4] },
  block: { height: 118, borderRadius: radii['2xl'], backgroundColor: colors.skeleton },
});
