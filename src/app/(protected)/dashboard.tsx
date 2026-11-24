import { useQuery } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';
import { RefreshControl, ScrollView, StyleSheet } from 'react-native';

import { AppText } from '@/components/AppText';
import { HabitatSelector } from '@/components/HabitatSelector';
import { LatestTelemetry } from '@/components/LatestTelemetry';
import { MetricsSkeleton } from '@/components/MetricsSkeleton';
import { Notice } from '@/components/Notice';
import { StatePanel } from '@/components/StatePanel';
import { toUserMessage } from '@/lib/api/errors';
import { queryKeys } from '@/lib/api/queryClient';
import { telemetryClient } from '@/lib/api/telemetryClient';
import { useHabitat } from '@/lib/context/HabitatContext';
import type { Habitat } from '@/lib/schemas/habitat';
import { gaia, spacing } from '@/theme';

function useLastTelemetry(habitat: Habitat | null) {
  return useQuery({
    queryKey: queryKeys.lastTelemetry(habitat?.id ?? null),
    queryFn: ({ signal }) => {
      if (!habitat) throw new Error('No habitat selected');
      return telemetryClient.getLast(habitat.id, signal);
    },
    enabled: habitat !== null,
  });
}

export default function DashboardScreen() {
  const { selectedHabitat, isLoading, error, refetch: refetchHabitats } = useHabitat();
  const telemetry = useLastTelemetry(selectedHabitat);
  const [isRefreshing, setIsRefreshing] = useState(false);

  async function handleRefresh() {
    setIsRefreshing(true);
    await Promise.all([
      refetchHabitats(),
      selectedHabitat ? telemetry.refetch() : Promise.resolve(),
    ]);
    setIsRefreshing(false);
  }

  function renderContent(): ReactNode {
    if (isLoading) return <MetricsSkeleton />;
    if (error) {
      return (
        <StatePanel
          title="Couldn't load your habitats"
          message={toUserMessage(error)}
          onRetry={() => void refetchHabitats()}
        />
      );
    }
    if (!selectedHabitat) {
      return (
        <StatePanel
          title="No habitats yet"
          message="Habitats you create will show up here. Pull down to refresh."
        />
      );
    }
    if (telemetry.isPending) return <MetricsSkeleton />;
    if (telemetry.data === undefined) {
      return (
        <StatePanel
          title="Couldn't load telemetry"
          message={toUserMessage(telemetry.error)}
          onRetry={() => void telemetry.refetch()}
        />
      );
    }
    return (
      <>
        {telemetry.isError && <Notice tone="critical" message={toUserMessage(telemetry.error)} />}
        {telemetry.data === null ? (
          <StatePanel
            title="No readings yet"
            message="This habitat has no telemetry. Readings will appear once its sensors report."
          />
        ) : (
          <LatestTelemetry reading={telemetry.data} />
        )}
      </>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={() => void handleRefresh()}
          tintColor={gaia.greenDeep}
          colors={[gaia.greenDeep]}
        />
      }
    >
      <AppText variant="title" color={gaia.greenDeep} accessibilityRole="header">
        Environmental telemetry
      </AppText>
      <HabitatSelector />
      {renderContent()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1, padding: spacing[4], gap: spacing[4] },
});
