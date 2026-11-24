import { formatTimestamp } from '@/lib/format/date';
import type { Telemetry } from '@/lib/schemas/telemetry';
import { getVpdLabel } from '@/lib/telemetry/vpdBands';
import { colors, vpdStatus } from '@/theme';

import { AppText } from './AppText';
import { MetricCard } from './MetricCard';

/** The three metric cards of a reading, and when it was recorded. */
export function LatestTelemetry({ reading }: { reading: Telemetry }) {
  const vpdLabel = getVpdLabel(reading.vpd);
  return (
    <>
      <MetricCard
        label="Temperature"
        value={reading.temperature.toFixed(1)}
        unit="°C"
        icon={{ ios: 'thermometer.medium', android: 'thermostat' }}
      />
      <MetricCard
        label="Humidity"
        value={String(Math.round(reading.humidity))}
        unit="%"
        icon={{ ios: 'humidity', android: 'humidity_percentage' }}
      />
      <MetricCard
        label="VPD"
        value={reading.vpd.toFixed(2)}
        unit="kPa"
        icon={{ ios: 'leaf', android: 'eco' }}
        badge={{ label: vpdLabel, ...vpdStatus[vpdLabel] }}
      />
      <AppText variant="caption" color={colors.textMuted}>
        Recorded at {formatTimestamp(reading.recordedAt)}
      </AppText>
    </>
  );
}
