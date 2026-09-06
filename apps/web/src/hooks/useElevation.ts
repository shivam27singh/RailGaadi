import { useQuery } from '@tanstack/react-query';
import { api } from '../services/apiClient';
import { ElevationData } from '@railgaddi/types';

export function useElevation(trainId: string | undefined) {
  return useQuery<ElevationData>({
    queryKey: ['elevation', trainId],
    queryFn: () => (trainId ? api.getElevation(trainId) : Promise.reject('No trainId')),
    enabled: !!trainId,
    staleTime: 30 * 60 * 1000, // 30 minutes cache
    retry: 1
  });
}
