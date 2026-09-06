import {
  ApiResponse,
  TrainSearchResult,
  Train,
  Journey,
  TrainStatus,
  TrainWeatherResponse,
  ElevationData,
  NearbyPlacesResponse,
  ShareJourneyResponse
} from '@railgaddi/types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

async function fetchJson<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers
      }
    });

    const data: ApiResponse<T> = await res.json();

    if (!res.ok || !data.success) {
      const errorMsg = data.error?.message || `Request failed with status ${res.status}`;
      const err: any = new Error(errorMsg);
      err.code = data.error?.code || 'API_ERROR';
      err.retryable = data.error?.retryable ?? false;
      throw err;
    }

    return data.data as T;
  } catch (error: any) {
    console.error(`[API FETCH ERROR] ${endpoint}:`, error);
    throw error;
  }
}

export const api = {
  /**
   * Search trains by query string.
   */
  searchTrains: (query: string): Promise<TrainSearchResult[]> => {
    return fetchJson<TrainSearchResult[]>(`/trains/search?q=${encodeURIComponent(query)}`);
  },

  /**
   * Get train metadata.
   */
  getTrain: (trainId: string): Promise<Train> => {
    return fetchJson<Train>(`/trains/${encodeURIComponent(trainId)}`);
  },

  /**
   * Get full journey data (train, status, route, progress, timeline).
   */
  getJourney: (trainId: string): Promise<Journey> => {
    return fetchJson<Journey>(`/trains/${encodeURIComponent(trainId)}/journey`);
  },

  /**
   * Get lightweight live position and status for polling.
   */
  getLiveStatus: (trainId: string): Promise<TrainStatus & { trainId: string; progressPercentage: number }> => {
    return fetchJson<TrainStatus & { trainId: string; progressPercentage: number }>(`/trains/${encodeURIComponent(trainId)}/live`);
  },

  /**
   * Get weather for current, next, and destination stations.
   */
  getWeather: (trainId: string): Promise<TrainWeatherResponse> => {
    return fetchJson<TrainWeatherResponse>(`/trains/${encodeURIComponent(trainId)}/weather`);
  },

  /**
   * Get route elevation profile.
   */
  getElevation: (trainId: string): Promise<ElevationData> => {
    return fetchJson<ElevationData>(`/trains/${encodeURIComponent(trainId)}/elevation`);
  },

  /**
   * Get nearby geographic features, rivers, bridges, and monuments.
   */
  getNearbyPlaces: (trainId: string): Promise<NearbyPlacesResponse> => {
    return fetchJson<NearbyPlacesResponse>(`/trains/${encodeURIComponent(trainId)}/nearby`);
  },

  /**
   * Create shareable journey URL.
   */
  createShare: (trainId: string, fromStationId?: string): Promise<ShareJourneyResponse> => {
    return fetchJson<ShareJourneyResponse>('/journeys/share', {
      method: 'POST',
      body: JSON.stringify({ trainId, fromStationId })
    });
  },

  /**
   * Resolve shared journey link.
   */
  getSharedJourney: (shareId: string): Promise<{ shareId: string; trainId: string; createdAt: string }> => {
    return fetchJson<{ shareId: string; trainId: string; createdAt: string }>(`/journeys/shared/${encodeURIComponent(shareId)}`);
  }
};
