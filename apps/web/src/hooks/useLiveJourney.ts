import { useState, useEffect, useRef, useCallback } from 'react';
import { Journey, TrainStatus } from '@railgaddi/types';
import { api } from '../services/apiClient';

interface UseLiveJourneyOptions {
  pollingIntervalMs?: number;
  enabled?: boolean;
}

export function useLiveJourney(trainId: string | undefined, options: UseLiveJourneyOptions = {}) {
  const { pollingIntervalMs = 20000, enabled = true } = options;

  const [journey, setJourney] = useState<Journey | null>(null);
  const [isLoading, setIsLoading] = useState(!!trainId); // only true if we have a trainId
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const pollTimerRef = useRef<any>(null);
  const isTabVisibleRef = useRef(typeof document !== 'undefined' ? !document.hidden : true);

  // Fetch full journey
  const loadFullJourney = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getJourney(id);
      setJourney(data);
    } catch (err: any) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Poll live status update
  const pollLiveStatus = useCallback(async (id: string) => {
    if (!isTabVisibleRef.current) return;

    setIsRefreshing(true);
    try {
      const live = await api.getLiveStatus(id);
      setJourney((prev) => {
        if (!prev) return prev;

        const updatedStatus: TrainStatus = {
          ...prev.status,
          status: live.status,
          delayMinutes: live.delayMinutes,
          currentStationId: live.currentStationId,
          nextStationId: live.nextStationId,
          etaToNextMinutes: live.etaToNextMinutes,
          liveLocation: live.liveLocation,
          updatedAt: live.updatedAt
        };

        const currentStation = prev.route.stations.find((s) => s.id === live.currentStationId) || prev.currentStation;
        const nextStation = prev.route.stations.find((s) => s.id === live.nextStationId) || prev.nextStation;

        return {
          ...prev,
          status: updatedStatus,
          currentStation,
          nextStation,
          progress: {
            ...prev.progress,
            percentage: live.progressPercentage
          },
          updatedAt: live.updatedAt
        };
      });
    } catch (err) {
      console.warn('[LIVE POLL WARN] Could not update live status', err);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  // Initial fetch when trainId changes
  useEffect(() => {
    if (!trainId || !enabled) {
      setJourney(null);
      setIsLoading(false);
      return;
    }

    loadFullJourney(trainId);
  }, [trainId, enabled, loadFullJourney]);

  // Polling & Visibility lifecycle
  useEffect(() => {
    if (!trainId || !enabled) return;

    const handleVisibilityChange = () => {
      const isVisible = !document.hidden;
      isTabVisibleRef.current = isVisible;
      if (isVisible) {
        // Tab just came into focus - immediately refresh live status
        pollLiveStatus(trainId);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Set up regular interval
    pollTimerRef.current = setInterval(() => {
      pollLiveStatus(trainId);
    }, pollingIntervalMs);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
      }
    };
  }, [trainId, enabled, pollingIntervalMs, pollLiveStatus]);

  // Manual refresh trigger
  const refetch = useCallback(() => {
    if (trainId) {
      loadFullJourney(trainId);
    }
  }, [trainId, loadFullJourney]);

  return {
    journey,
    isLoading,
    isRefreshing,
    error,
    refetch
  };
}
