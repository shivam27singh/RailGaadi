import { useState, useEffect, useCallback } from 'react';
import { TrainSearchResult } from '@railgaddi/types';

const FAVORITES_KEY = 'railgaddi_favorites_v1';

export function useFavorites() {
  const [favorites, setFavorites] = useState<TrainSearchResult[]>(() => {
    try {
      const stored = localStorage.getItem(FAVORITES_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    } catch (e) {
      console.warn('Failed to persist favorites to localStorage', e);
    }
  }, [favorites]);

  const isFavorite = useCallback(
    (trainId: string) => favorites.some((f) => f.id === trainId),
    [favorites]
  );

  const toggleFavorite = useCallback((train: TrainSearchResult) => {
    setFavorites((prev) => {
      const exists = prev.some((item) => item.id === train.id);
      if (exists) {
        return prev.filter((item) => item.id !== train.id);
      } else {
        return [train, ...prev];
      }
    });
  }, []);

  return {
    favorites,
    isFavorite,
    toggleFavorite
  };
}
