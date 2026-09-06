/**
 * RailRadar API Client — correct response structure mapping.
 *
 * Schedule endpoint GET /v1/trains/:number:
 *   { success, data: { train: {...}, route: ScheduleStop[] }, meta }
 *
 * Live endpoint GET /v1/trains/:number/live:
 *   { success, data: { trainNumber, trainName, status, isLive, lastUpdatedAt,
 *     delayMinutes, currentLocation: {...}, previousHalt, nextHalt,
 *     route: LiveStop[], train: {...} }, meta }
 */

// ── Schedule types ──────────────────────────────────────────────────────────

export interface RailRadarStation {
  code: string;
  name: string;
  lat: number;
  lng: number;
}

export interface RailRadarTrainMeta {
  number: string;
  name: string;
  type?: string;
  category?: string;
  source?: RailRadarStation;
  destination?: RailRadarStation;
  runDays?: string[];
  avgSpeed?: number;
  maxSpeed?: number;
  distance?: number;
  duration?: number;
  totalHalts?: number;
}

export interface RailRadarScheduleStop {
  sequence: number;
  station: RailRadarStation;
  isHalt: boolean;
  platform?: string;
  arrival?: string;         // "HH:MM" — may be absent for first stop
  arrivalDay?: number;
  departure?: string;       // "HH:MM" — may be absent for last stop
  departureDay?: number;
  distance: number;         // km from origin
  speedToNextStationKmph?: number;
}

export interface RailRadarScheduleData {
  train: RailRadarTrainMeta;
  route: RailRadarScheduleStop[];   // the full schedule array
}

// ── Live types ──────────────────────────────────────────────────────────────

export interface RailRadarCurrentLocation {
  stationCode: string;
  stationName: string;
  sequence: number;
  status: string;           // "at_station" | "departed" | "arrived"
  isHalt: boolean;
  isActualPosition?: boolean;
  positionSource?: string;  // "gps-refined" | "interpolated"
  distanceFromOriginKm: number;
  distanceFromLastStationKm?: number;
  segmentProgress?: number;
  delayMinutes: number;
  lat?: number;
  lng?: number;
}

export interface RailRadarLiveStop {
  sequence: number;
  stationCode: string;
  stationName: string;
  isHalt: boolean;
  status: string;           // "completed" | "current" | "upcoming"
  scheduledArrival?: string;
  actualArrival?: string;
  delayArrival?: number;
  scheduledDeparture?: string;
  actualDeparture?: string;
  delayDeparture?: number;
  platform?: string;
  distance?: number;
}

export interface RailRadarLiveData {
  trainNumber: string;
  trainName: string;
  status: string;           // "running" | "completed" | "cancelled"
  isLive?: boolean;
  trackingMode?: string;
  lastUpdatedAt: string;
  delayMinutes?: number;
  startDate?: string;
  currentLocation?: RailRadarCurrentLocation;
  previousHalt?: RailRadarLiveStop;
  nextHalt?: RailRadarLiveStop;
  route?: RailRadarLiveStop[];
  train?: RailRadarTrainMeta;
}

// ── Search result type ──────────────────────────────────────────────────────

export interface RailRadarSearchResult {
  trainNumber: string;
  trainName: string;
  trainType?: string;
  source?: RailRadarStation;
  destination?: RailRadarStation;
  departureTime?: string;
  arrivalTime?: string;
}

// ── Client ──────────────────────────────────────────────────────────────────

export class RailRadarClient {
  private baseUrl = 'https://api.railradar.in/v1';

  private scheduleCache = new Map<string, { data: RailRadarScheduleData; cachedAt: number }>();
  private liveCache = new Map<string, { data: RailRadarLiveData; cachedAt: number }>();
  private searchCache = new Map<string, { data: RailRadarSearchResult[]; cachedAt: number }>();

  private SCHEDULE_TTL_MS = 60 * 60 * 1000;  // 1 hour
  private LIVE_TTL_MS = 15 * 1000;            // 15 seconds
  private SEARCH_TTL_MS = 5 * 60 * 1000;     // 5 minutes

  /** Lazily read from environment so dotenv.config() in index.ts takes effect first */
  private get apiKey(): string {
    return process.env.RAILRADAR_API_KEY || '';
  }

  private getHeaders() {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  }

  /**
   * Fetch full schedule for any train number.
   * Returns { train, route[] } from the schedule endpoint.
   */
  public async fetchTrainSchedule(trainNumber: string): Promise<RailRadarScheduleData | null> {
    if (!this.apiKey) {
      console.warn('[RAILRADAR] No API key configured');
      return null;
    }

    const cached = this.scheduleCache.get(trainNumber);
    if (cached && Date.now() - cached.cachedAt < this.SCHEDULE_TTL_MS) {
      return cached.data;
    }

    try {
      const url = `${this.baseUrl}/trains/${encodeURIComponent(trainNumber)}`;
      console.log(`[RAILRADAR] GET ${url}`);
      const res = await fetch(url, {
        headers: this.getHeaders(),
        signal: AbortSignal.timeout(10000)
      });

      if (!res.ok) {
        console.warn(`[RAILRADAR] Schedule HTTP ${res.status} for ${trainNumber}`);
        return null;
      }

      const json = await res.json();
      if (json.success && json.data && json.data.train && Array.isArray(json.data.route)) {
        const data: RailRadarScheduleData = {
          train: json.data.train,
          route: json.data.route
        };
        this.scheduleCache.set(trainNumber, { data, cachedAt: Date.now() });
        console.log(`[RAILRADAR] Schedule OK for ${trainNumber}: ${json.data.route.length} stops`);
        return data;
      }
      console.warn(`[RAILRADAR] Unexpected schedule response structure for ${trainNumber}:`, Object.keys(json.data || {}));
      return null;
    } catch (err: any) {
      console.warn(`[RAILRADAR] Network error (schedule/${trainNumber}):`, err.message);
      return null;
    }
  }

  /**
   * Fetch live running status for any train number.
   */
  public async fetchLiveStatus(trainNumber: string): Promise<RailRadarLiveData | null> {
    if (!this.apiKey) return null;

    const cached = this.liveCache.get(trainNumber);
    if (cached && Date.now() - cached.cachedAt < this.LIVE_TTL_MS) {
      return cached.data;
    }

    try {
      const url = `${this.baseUrl}/trains/${encodeURIComponent(trainNumber)}/live`;
      console.log(`[RAILRADAR] GET ${url}`);
      const res = await fetch(url, {
        headers: this.getHeaders(),
        signal: AbortSignal.timeout(8000)
      });

      if (!res.ok) {
        console.warn(`[RAILRADAR] Live HTTP ${res.status} for ${trainNumber}`);
        return null;
      }

      const json = await res.json();
      if (json.success && json.data) {
        const data: RailRadarLiveData = json.data;
        this.liveCache.set(trainNumber, { data, cachedAt: Date.now() });
        console.log(`[RAILRADAR] Live OK for ${trainNumber}: delay=${data.delayMinutes}min, loc=${data.currentLocation?.stationName}`);
        return data;
      }
      return null;
    } catch (err: any) {
      console.warn(`[RAILRADAR] Network error (live/${trainNumber}):`, err.message);
      return null;
    }
  }

  /**
   * Search for trains by query.
   * Strategy 1: Try RailRadar search endpoint.
   * Strategy 2: If numeric query, try direct schedule fetch.
   */
  public async searchTrains(query: string): Promise<RailRadarSearchResult[]> {
    if (!this.apiKey || !query.trim()) return [];

    const cleanQuery = query.trim();
    const cacheKey = cleanQuery.toLowerCase();
    const cached = this.searchCache.get(cacheKey);
    if (cached && Date.now() - cached.cachedAt < this.SEARCH_TTL_MS) {
      return cached.data;
    }

    const results: RailRadarSearchResult[] = [];

    // Strategy 1: Search endpoint
    try {
      const searchUrl = `${this.baseUrl}/trains/search?q=${encodeURIComponent(cleanQuery)}`;
      console.log(`[RAILRADAR] GET ${searchUrl}`);
      const res = await fetch(searchUrl, {
        headers: this.getHeaders(),
        signal: AbortSignal.timeout(8000)
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          results.push(...json.data.map((item: any) => ({
            trainNumber: item.trainNumber || item.number || '',
            trainName: item.trainName || item.name || '',
            trainType: item.type || item.category,
            source: item.source,
            destination: item.destination,
            departureTime: item.departureTime,
            arrivalTime: item.arrivalTime
          })));
        }
      }
    } catch (err: any) {
      console.warn('[RAILRADAR] Search endpoint error:', err.message);
    }

    // Strategy 2: Numeric query — direct schedule lookup
    if (results.length === 0 && /^\d{4,6}$/.test(cleanQuery)) {
      const schedule = await this.fetchTrainSchedule(cleanQuery);
      if (schedule && schedule.route.length > 0) {
        const first = schedule.route[0];
        const last = schedule.route[schedule.route.length - 1];
        results.push({
          trainNumber: schedule.train.number,
          trainName: schedule.train.name,
          trainType: schedule.train.type || schedule.train.category,
          source: first.station,
          destination: last.station,
          departureTime: first.departure || first.arrival || '--:--',
          arrivalTime: last.arrival || last.departure || '--:--'
        });
      }
    }

    const deduped = deduplicateByNumber(results);
    this.searchCache.set(cacheKey, { data: deduped, cachedAt: Date.now() });
    return deduped;
  }
}

function deduplicateByNumber(results: RailRadarSearchResult[]): RailRadarSearchResult[] {
  const seen = new Set<string>();
  return results.filter(r => {
    if (!r.trainNumber || seen.has(r.trainNumber)) return false;
    seen.add(r.trainNumber);
    return true;
  });
}

export const railRadarClient = new RailRadarClient();
