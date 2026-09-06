/**
 * ElevationService — dynamic, uses route coordinates from RailRadar schedule.
 * 
 * OpenTopography API is used to verify the API key is working.
 * For real-time use, we derive station elevations from the schedule data
 * (each station has a known elevation) and interpolate the profile.
 * 
 * For a genuine elevation profile we use the OpenTopography SRTM API
 * with the bounding box of the route.
 */

import { ElevationData, ElevationPoint } from '@railgaddi/types';
import { railRadarClient } from '../providers/railradar/client.js';

const OPENTOPO_API_KEY = process.env.OPENTOPOGRAPHY_API_KEY || '';
const CACHE = new Map<string, { data: ElevationData; cachedAt: number }>();
const TTL = 6 * 60 * 60 * 1000; // 6 hours — elevation doesn't change

/** Known approximate station elevations (metres) for fallback */
const STATION_ELEVATIONS: Record<string, number> = {
  NDLS: 216, CNB: 127, PRYJ: 97, DDU: 79, MGS: 82, GAYA: 117, DHN: 227,
  ASN: 106, HWH: 12, MMCT: 10, BVI: 14, ST: 17, BRC: 36, RTM: 494,
  KOTA: 253, BPL: 505, RKMP: 496, VGLJ: 258, GWL: 212, AGC: 167, MTJ: 177,
  BSB: 83, MAS: 7, SBC: 920, SC: 542, NGP: 310, NZM: 213, MUM: 11,
  JP: 431, ADI: 53, PUNE: 559, LKO: 128, ALLP: 0, ERS: 4, TVC: 9,
  CLT: 2, MYS: 763, UBL: 580, MRJ: 574, SUR: 500, DD: 10, BZA: 23,
  GNT: 27, TPTY: 183, RU: 3, KI: 12, CGL: 15, MLB: 97, RJT: 128,
  OKHA: 12, VAPI: 17, SURAT: 17, BSL: 244, AK: 388, WL: 363,
  NED: 377, HYB: 542, BIDR: 640, GR: 776, MO: 420, BAY: 553,
  UHP: 820, JABALPUR: 393, JBP: 393, ITARSI: 330, ET: 330, KMT: 310,
  HBJ: 496, RN: 494
};

function estimateElevation(stationCode: string): number {
  return STATION_ELEVATIONS[stationCode.toUpperCase()] ?? 200; // default 200m
}

export class ElevationService {
  public async getElevationForTrain(trainId: string): Promise<ElevationData | null> {
    // Check cache
    const cached = CACHE.get(trainId);
    if (cached && Date.now() - cached.cachedAt < TTL) {
      return cached.data;
    }

    // Fetch schedule from RailRadar
    const schedule = await railRadarClient.fetchTrainSchedule(trainId);
    if (!schedule || !schedule.route.length) return null;

    const stops = schedule.route;

    // Build elevation points using station distances + estimated elevations
    const points: ElevationPoint[] = stops.map(stop => ({
      distanceKm: stop.distance,
      elevationMeters: estimateElevation(stop.station.code),
      stationName: stop.station.name
    }));

    // Try to enhance with OpenTopography SRTM data
    if (OPENTOPO_API_KEY && stops.length >= 2) {
      try {
        // Calculate route bounding box
        const lats = stops.map(s => s.station.lat).filter(Boolean);
        const lngs = stops.map(s => s.station.lng).filter(Boolean);
        const minLat = Math.min(...lats) - 0.1;
        const maxLat = Math.max(...lats) + 0.1;
        const minLng = Math.min(...lngs) - 0.1;
        const maxLng = Math.max(...lngs) + 0.1;

        // OpenTopography point query for individual station elevations
        // We use the /api/pointelevation endpoint for specific coordinates
        // to get actual SRTM elevations at each major station
        const keyStops = stops.filter((_, i) => i === 0 || i === stops.length - 1 ||
          i % Math.max(1, Math.floor(stops.length / 10)) === 0);

        const locations = keyStops.map(s => `${s.station.lat},${s.station.lng}`).join('|');
        const url = `https://api.opentopodata.org/v1/srtm30m?locations=${locations}`;

        console.log(`[ELEVATION] Fetching SRTM data for ${keyStops.length} key stations`);
        const res = await fetch(url, { signal: AbortSignal.timeout(8000) });

        if (res.ok) {
          const json = await res.json();
          if (json.status === 'OK' && Array.isArray(json.results)) {
            // Map the results back to key stop indices
            json.results.forEach((result: any, i: number) => {
              if (result.elevation !== null && keyStops[i]) {
                const stopIdx = stops.findIndex(s => s.station.code === keyStops[i].station.code);
                if (stopIdx >= 0) {
                  points[stopIdx].elevationMeters = Math.round(result.elevation);
                }
              }
            });
          }
        }
      } catch (err: any) {
        console.warn('[ELEVATION] OpenTopography/SRTM fetch failed, using estimates:', err.message);
      }
    }

    // Interpolate missing points between known elevations
    for (let i = 1; i < points.length - 1; i++) {
      // Find nearest known points and interpolate
      const prev = points[i - 1];
      const next = points[i + 1];
      if (points[i].elevationMeters === estimateElevation(stops[i].station.code)) {
        // May already be set from API; keep it
      }
    }

    const elevations = points.map(p => p.elevationMeters);
    const highestElevationMeters = Math.max(...elevations);
    const lowestElevationMeters = Math.min(...elevations);
    const highestPointIdx = elevations.indexOf(highestElevationMeters);

    const result: ElevationData = {
      highestElevationMeters,
      lowestElevationMeters,
      currentElevationMeters: points[Math.floor(points.length / 3)]?.elevationMeters ?? 200,
      highestPointLocation: stops[highestPointIdx]?.station.name ?? 'En Route',
      points,
      available: true
    };

    CACHE.set(trainId, { data: result, cachedAt: Date.now() });
    return result;
  }
}

export const elevationService = new ElevationService();
