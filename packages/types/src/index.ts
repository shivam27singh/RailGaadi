export type TrainRunningStatus =
  | 'ON_TIME'
  | 'DELAYED'
  | 'EARLY'
  | 'ARRIVING'
  | 'ARRIVED'
  | 'NOT_STARTED'
  | 'COMPLETED'
  | 'DATA_UNAVAILABLE';

export interface Station {
  id: string;
  code: string;
  name: string;
  latitude: number;
  longitude: number;
  city?: string;
  state?: string;
  elevationMeters?: number;
}

export interface Train {
  id: string;
  number: string;
  name: string;
  type: string; // Rajdhani, Shatabdi, Vande Bharat, Superfast, Mail/Express
  sourceStation: Station;
  destinationStation: Station;
  departureTime: string;
  arrivalTime: string;
  totalDurationFormatted: string;
  runningDays: string[];
}

export interface LiveLocation {
  latitude: number;
  longitude: number;
  bearing: number; // in degrees 0-360
  speedKmph: number;
  updatedAt: string;
  isSimulated?: boolean;
}

export interface TrainStatus {
  status: TrainRunningStatus;
  delayMinutes: number;
  currentStationId?: string;
  nextStationId?: string;
  lastPassedStationId?: string;
  etaToNextMinutes?: number;
  liveLocation: LiveLocation;
  updatedAt: string;
  staleThresholdMinutes?: number;
}

export interface JourneyProgress {
  percentage: number;
  distanceCoveredKm: number;
  distanceRemainingKm: number;
  totalDistanceKm: number;
  stationsCompleted: number;
  stationsRemaining: number;
  totalStations: number;
}

export interface RouteGeometry {
  type: 'LineString';
  coordinates: [number, number][]; // [longitude, latitude]
}

export interface Route {
  geometry: RouteGeometry;
  stations: Station[];
  totalDistanceKm: number;
}

export interface StationTimelineItem {
  station: Station;
  scheduledArrival: string;
  actualArrival?: string;
  scheduledDeparture: string;
  actualDeparture?: string;
  platform?: string;
  delayMinutes: number;
  distanceFromOriginKm: number;
  status: 'COMPLETED' | 'CURRENT' | 'UPCOMING' | 'SKIPPED';
  haltDurationMinutes: number;
  isHalt?: boolean;
}

export interface Journey {
  train: Train;
  status: TrainStatus;
  route: Route;
  progress: JourneyProgress;
  timeline: StationTimelineItem[];
  currentStation?: Station;
  nextStation?: Station;
  updatedAt: string;
}

export interface Weather {
  stationId: string;
  stationName: string;
  temperatureC: number;
  condition: string;
  description: string;
  icon: string;
  humidityPercentage: number;
  windSpeedKmph: number;
  rainProbabilityPercentage: number;
  updatedAt: string;
}

export interface RouteRainForecast {
  stationName: string;
  rainProbabilityPercentage: number;
  etaHoursAndMinutes: string;
  summary: string;
}

export interface TrainWeatherResponse {
  current?: Weather;
  next?: Weather;
  destination?: Weather;
  routeForecast: RouteRainForecast[];
  summaryMessage: string;
}

export interface ElevationPoint {
  distanceKm: number;
  elevationMeters: number;
  stationName?: string;
}

export interface ElevationData {
  highestElevationMeters: number;
  lowestElevationMeters: number;
  currentElevationMeters: number;
  highestPointLocation: string;
  points: ElevationPoint[];
  available: boolean;
}

export type NearbyFeatureType =
  | 'RIVER'
  | 'LAKE'
  | 'MOUNTAIN'
  | 'BRIDGE'
  | 'TUNNEL'
  | 'MONUMENT'
  | 'CITY';

export interface NearbyPlace {
  id: string;
  name: string;
  category: NearbyFeatureType;
  description: string;
  latitude: number;
  longitude: number;
  distanceFromTrackKm: number;
  nearStationName: string;
  photoUrl?: string;
}

export interface NearbyPlacesResponse {
  rivers: NearbyPlace[];
  lakes: NearbyPlace[];
  mountains: NearbyPlace[];
  bridges: NearbyPlace[];
  tunnels: NearbyPlace[];
  monuments: NearbyPlace[];
  cities: NearbyPlace[];
  featuredCrossing?: NearbyPlace;
}

export interface TrainSearchResult {
  id: string;
  number: string;
  name: string;
  type: string;
  sourceStation: Station;
  destinationStation: Station;
  departureTime: string;
  arrivalTime: string;
}

export interface ShareJourneyResponse {
  shareId: string;
  trainId: string;
  url: string;
  createdAt: string;
  expiresAt?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    retryable: boolean;
  };
}
