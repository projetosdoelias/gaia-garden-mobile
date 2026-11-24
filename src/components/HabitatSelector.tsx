import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useHabitat } from '@/lib/context/HabitatContext';
import { colors, gaia, radii, shadows, spacing, TOUCH_TARGET } from '@/theme';

import { AppText } from './AppText';

/** Shows the selected habitat and opens a sheet to choose another one. */
export function HabitatSelector() {
  const { habitats, selectedHabitat, selectHabitat } = useHabitat();
  const [open, setOpen] = useState(false);
  const insets = useSafeAreaInsets();

  if (!selectedHabitat) return null;
  const close = () => setOpen(false);

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Habitat: ${selectedHabitat.title}`}
        accessibilityHint="Opens the list of habitats"
        onPress={() => setOpen(true)}
        style={({ pressed }) => [styles.trigger, pressed && styles.pressed]}
      >
        <View style={styles.triggerText}>
          <AppText variant="label" color={colors.textMuted}>
            Habitat
          </AppText>
          <AppText variant="bodyStrong" color={gaia.greenDeep} numberOfLines={1}>
            {selectedHabitat.title}
          </AppText>
        </View>
        <SymbolView
          name={{ ios: 'chevron.down', android: 'keyboard_arrow_down' }}
          size={20}
          tintColor={gaia.greenDeep}
        />
      </Pressable>

      <Modal visible={open} transparent animationType="slide" onRequestClose={close}>
        <View style={styles.overlay}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close"
            onPress={close}
            style={StyleSheet.absoluteFill}
          />
          <View
            accessibilityViewIsModal
            style={[styles.sheet, { paddingBottom: insets.bottom + spacing[4] }]}
          >
            <AppText variant="heading" color={gaia.greenDeep}>
              Select a habitat
            </AppText>
            <ScrollView>
              {habitats.map((habitat) => {
                const selected = habitat.id === selectedHabitat.id;
                return (
                  <Pressable
                    key={habitat.id}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: selected }}
                    onPress={() => {
                      selectHabitat(habitat.id);
                      close();
                    }}
                    style={({ pressed }) => [
                      styles.option,
                      selected && styles.selected,
                      pressed && styles.pressed,
                    ]}
                  >
                    <AppText
                      variant={selected ? 'bodyStrong' : 'body'}
                      color={gaia.greenDeep}
                      numberOfLines={1}
                      style={styles.optionText}
                    >
                      {habitat.title}
                    </AppText>
                    {selected && (
                      <SymbolView
                        name={{ ios: 'checkmark', android: 'check' }}
                        size={18}
                        tintColor={gaia.greenDeep}
                      />
                    )}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    minHeight: TOUCH_TARGET,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.xl,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    ...shadows.sm,
  },
  triggerText: { flex: 1 },
  pressed: { opacity: 0.8 },
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: colors.overlay },
  sheet: {
    maxHeight: '70%',
    gap: spacing[3],
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii['2xl'],
    borderTopRightRadius: radii['2xl'],
    padding: spacing[6],
    ...shadows.lg,
  },
  option: {
    minHeight: TOUCH_TARGET,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    borderRadius: radii.lg,
    paddingHorizontal: spacing[3],
  },
  selected: { backgroundColor: gaia.greenSignal },
  optionText: { flex: 1 },
});
