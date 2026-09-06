import { useQuery } from '@tanstack/react-query';
import { api } from '../services/apiClient';
import { TrainWeatherResponse } from '@railgaddi/types';

export function useWeather(trainId: string | undefined) {
  return useQuery<TrainWeatherResponse>({
    queryKey: ['weather', trainId],
    queryFn: () => (trainId ? api.getWeather(trainId) : Promise.reject('No trainId')),
    enabled: !!trainId,
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    retry: 1
  });
}
