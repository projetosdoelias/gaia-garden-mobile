/**
 * VPD display bands (kPa), same labels and thresholds as the web app. Presentation only:
 * the backend calculates the value.
 *
 * <0.4 Too Low, <0.8 Low, 0.8–1.2 Ideal, ≤1.6 High, >1.6 Critical.
 */
export type VpdLabel = 'Too Low' | 'Low' | 'Ideal' | 'High' | 'Critical';

type VpdBand = { label: VpdLabel; max: number; maxInclusive: boolean };

const VPD_BANDS: readonly VpdBand[] = [
  { label: 'Too Low', max: 0.4, maxInclusive: false },
  { label: 'Low', max: 0.8, maxInclusive: false },
  { label: 'Ideal', max: 1.2, maxInclusive: true },
  { label: 'High', max: 1.6, maxInclusive: true },
];

/** The label of the first band the value falls in. */
export function getVpdLabel(vpd: number): VpdLabel {
  const band = VPD_BANDS.find(({ max, maxInclusive }) => (maxInclusive ? vpd <= max : vpd < max));
  return band?.label ?? 'Critical';
}
