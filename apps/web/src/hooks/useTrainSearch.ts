import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/apiClient';
import { TrainSearchResult } from '@railgaddi/types';

export function useTrainSearch(query: string) {
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 280);

    return () => clearTimeout(handler);
  }, [query]);

  const searchQuery = useQuery<TrainSearchResult[]>({
    queryKey: ['trainSearch', debouncedQuery],
    queryFn: () => api.searchTrains(debouncedQuery),
    enabled: debouncedQuery.length > 0,
    staleTime: 60 * 1000,
    placeholderData: (previousData) => previousData
  });

  return {
    results: searchQuery.data || [],
    isLoading: searchQuery.isLoading && debouncedQuery.length > 0,
    isError: searchQuery.isError,
    error: searchQuery.error,
    debouncedQuery
  };
}
