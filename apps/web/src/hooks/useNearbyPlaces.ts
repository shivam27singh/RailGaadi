import { useQuery } from '@tanstack/react-query';
import { api } from '../services/apiClient';
import { NearbyPlacesResponse } from '@railgaddi/types';

export function useNearbyPlaces(trainId: string | undefined) {
  return useQuery<NearbyPlacesResponse>({
    queryKey: ['nearbyPlaces', trainId],
    queryFn: () => (trainId ? api.getNearbyPlaces(trainId) : Promise.reject('No trainId')),
    enabled: !!trainId,
    staleTime: 15 * 60 * 1000,
    retry: 1
  });
}
