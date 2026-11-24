import { StyleSheet, type TextStyle, type ViewStyle } from 'react-native';

/**
 * The only place with raw color values. Names follow the web app's `gaia-*` tokens
 * (`globals.css`), e.g. `gaia-greenDeep` is `gaia.greenDeep`.
 */
export const gaia = {
  bg: '#f3f6f2',
  darkText: '#252d2a',
  cardDark: '#373c3f',
  greenDeep: '#0f3b2e',
  greenMint: '#a4e0c3',
  greenSignal: '#b5edd2',
  alert: {
    critical: '#d9534f',
    warning: '#e6a23c',
    success: '#42b983',
  },
} as const;

/** Roles derived from the palette (the web uses opacity modifiers and neutral grays for these). */
export const colors = {
  surface: '#ffffff',
  onPrimary: '#ffffff',
  border: '#e5e7eb',
  textMuted: '#5f6b66',
  textPlaceholder: '#8b9490',
  skeleton: '#e3e9e4',
  overlay: 'rgba(0, 0, 0, 0.4)',
  tabInactive: '#c4d3cc',
  avatar: '#dfe7e2',
  /** Accessible text color on a critical or warning notice. */
  criticalText: '#a12f2b',
  criticalBg: '#fbeeed',
  criticalBorder: '#f3cfcd',
  warningText: '#7a4f0a',
  warningBg: '#fdf4e6',
  warningBorder: '#f5dfb8',
} as const;

/** Status colors of the VPD bands (blue, amber, emerald, orange, red on the web). */
export const vpdStatus = {
  'Too Low': { text: '#1d4ed8', bg: '#eff6ff' },
  Low: { text: '#92400e', bg: '#fffbeb' },
  Ideal: { text: '#047857', bg: '#ecfdf5' },
  High: { text: '#9a3412', bg: '#fff7ed' },
  Critical: { text: '#b91c1c', bg: '#fef2f2' },
} as const;

/** 4pt scale, same steps as Tailwind (`spacing[4]` = `p-4`). */
export const spacing = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  12: 48,
} as const;

export const radii = {
  lg: 8,
  xl: 12,
  '2xl': 16,
  full: 999,
} as const;

/** System font: the web declares Geist but falls back to the system sans. */
export const typography = {
  hero: { fontSize: 32, lineHeight: 38, fontWeight: '800', letterSpacing: -0.6 },
  title: { fontSize: 24, lineHeight: 30, fontWeight: '700', letterSpacing: -0.4 },
  heading: { fontSize: 18, lineHeight: 24, fontWeight: '700' },
  body: { fontSize: 16, lineHeight: 22 },
  bodyStrong: { fontSize: 16, lineHeight: 22, fontWeight: '600' },
  small: { fontSize: 14, lineHeight: 20 },
  caption: { fontSize: 12, lineHeight: 16 },
  label: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  metric: { fontSize: 36, lineHeight: 42, fontWeight: '800', letterSpacing: -0.8 },
} as const satisfies Record<string, TextStyle>;

export const shadows = {
  sm: { boxShadow: '0px 1px 3px rgba(15, 59, 46, 0.10)' },
  lg: { boxShadow: '0px 8px 24px rgba(15, 59, 46, 0.18)' },
} as const satisfies Record<string, ViewStyle>;

/** Minimum touch target. */
export const TOUCH_TARGET = 48;

export const hairline = StyleSheet.hairlineWidth;
