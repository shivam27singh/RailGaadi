import { useState, useEffect, useCallback } from 'react';
import { TrainSearchResult } from '@railgaddi/types';

const RECENT_SEARCHES_KEY = 'railgaddi_recent_searches_v1';
const MAX_RECENT = 8;

export function useRecentSearches() {
  const [recentSearches, setRecentSearches] = useState<TrainSearchResult[]>(() => {
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(recentSearches));
    } catch (e) {
      console.warn('Failed to persist recent searches to localStorage', e);
    }
  }, [recentSearches]);

  const addRecentSearch = useCallback((train: TrainSearchResult) => {
    setRecentSearches((prev) => {
      // Remove any existing duplicate
      const filtered = prev.filter((item) => item.id !== train.id);
      // Place new search at front, capped to MAX_RECENT
      return [train, ...filtered].slice(0, MAX_RECENT);
    });
  }, []);

  const removeRecentSearch = useCallback((trainId: string) => {
    setRecentSearches((prev) => prev.filter((item) => item.id !== trainId));
  }, []);

  const clearAllRecent = useCallback(() => {
    setRecentSearches([]);
    try {
      localStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch {}
  }, []);

  return {
    recentSearches,
    addRecentSearch,
    removeRecentSearch,
    clearAllRecent
  };
}
