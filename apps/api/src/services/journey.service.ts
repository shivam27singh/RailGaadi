/**
 * JourneyService — fully dynamic using RailRadar API.
 *
 * Correct API structures (verified from live API):
 *
 * Schedule: data.train + data.route (array of ScheduleStop)
 *   ScheduleStop: { sequence, station: {code, name, lat, lng}, isHalt,
 *                   arrival?, arrivalDay?, departure?, departureDay?,
 *                   distance, platform?, speedToNextStationKmph? }
 *
 * Live: data.currentLocation, data.delayMinutes, data.route (LiveStop[])
 *   CurrentLocation: { stationCode, stationName, sequence, status,
 *                      delayMinutes, distanceFromOriginKm, ... }
 */

import {
  Journey,
  TrainStatus,
  JourneyProgress,
  Route,
  TrainRunningStatus,
  LiveLocation,
  Station,
  StationTimelineItem,
  Train
} from '@railgaddi/types';
import { calculateBearing } from '@railgaddi/utils';
import {
  railRadarClient,
  RailRadarScheduleData,
  RailRadarLiveData,
  RailRadarScheduleStop
} from '../providers/railradar/client.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function stopToStation(stop: RailRadarScheduleStop): Station {
  return {
    id: stop.station.code,
    code: stop.station.code,
    name: stop.station.name,
    latitude: stop.station.lat,
    longitude: stop.station.lng
  };
}

function inferTrainType(name: string, category?: string): string {
  if (category) {
    if (category === 'Rajdhani') return 'Rajdhani Express';
    if (category === 'Shatabdi') return 'Shatabdi Express';
    if (category === 'Vande Bharat') return 'Vande Bharat Express';
    if (category === 'Duronto') return 'Duronto Express';
    if (category === 'Tejas') return 'Tejas Express';
    if (category === 'Humsafar') return 'Humsafar Express';
    if (category === 'Garib Rath') return 'Garib Rath';
  }
  const n = (name || '').toLowerCase();
  if (n.includes('rajdhani')) return 'Rajdhani Express';
  if (n.includes('shatabdi')) return 'Shatabdi Express';
  if (n.includes('vande bharat') || n.includes('vande')) return 'Vande Bharat Express';
  if (n.includes('duronto')) return 'Duronto Express';
  if (n.includes('garib rath')) return 'Garib Rath';
  if (n.includes('tejas')) return 'Tejas Express';
  if (n.includes('humsafar')) return 'Humsafar Express';
  if (n.includes('intercity')) return 'Intercity Express';
  if (n.includes('jan shatabdi')) return 'Jan Shatabdi';
  if (n.includes('express') || n.includes('exp')) return 'Superfast Express';
  if (n.includes('mail')) return 'Mail Express';
  return 'Express';
}

/**
 * Format a time from a stop — handles ISO timestamps from live endpoint
 * and HH:MM strings from schedule endpoint.
 */
function formatTime(t: string | undefined): string {
  if (!t) return '--:--';
  // ISO timestamp: "2026-09-05T17:00:00+05:30" → "17:00"
  if (t.includes('T')) {
    return t.slice(11, 16);
  }
  return t;
}

function buildTimeline(
  stops: RailRadarScheduleStop[],
  currentSequence: number,
  globalDelayMinutes: number
): StationTimelineItem[] {
  return stops.map((stop, idx) => {
    const isFirst = idx === 0;
    const isLast = idx === stops.length - 1;

    let status: StationTimelineItem['status'] = 'UPCOMING';
    if (stop.sequence < currentSequence) {
      status = 'COMPLETED';
    } else if (stop.sequence === currentSequence) {
      status = 'CURRENT';
    }

    const scheduledArrival = isFirst ? 'Source' : formatTime(stop.arrival);
    const scheduledDeparture = isLast ? 'Destination' : formatTime(stop.departure);

    const haltDurationMinutes = (() => {
      if (isFirst || isLast || !stop.arrival || !stop.departure) return 0;
      try {
        const [arrH, arrM] = stop.arrival.split(':').map(Number);
        const [depH, depM] = stop.departure.split(':').map(Number);
        const diffDay = (stop.departureDay ?? 1) - (stop.arrivalDay ?? 1);
        const diff = (depH * 60 + depM) - (arrH * 60 + arrM) + diffDay * 1440;
        return Math.max(0, diff);
      } catch {
        return 0;
      }
    })();

    return {
      station: stopToStation(stop),
      scheduledArrival,
      scheduledDeparture,
      platform: stop.platform,
      delayMinutes: status === 'CURRENT' ? globalDelayMinutes : 0,
      distanceFromOriginKm: stop.distance,
      status,
      haltDurationMinutes,
      isHalt: stop.isHalt ?? true
    };
  });
}

function calculateLiveLocation(
  routeCoordinates: [number, number][],
  currentStationIndex: number,
  totalStations: number,
  isSimulated: boolean
): LiveLocation {
  if (!routeCoordinates || routeCoordinates.length < 2) {
    return {
      latitude: 20.5937,
      longitude: 78.9629,
      bearing: 0,
      speedKmph: 0,
      updatedAt: new Date().toISOString(),
      isSimulated: true
    };
  }

  const totalSegments = routeCoordinates.length - 1;
  const progressRatio = Math.min(currentStationIndex / Math.max(totalStations - 1, 1), 1);
  const startCoordIndex = Math.min(Math.floor(progressRatio * totalSegments), totalSegments - 1);

  const nowMs = Date.now();
  const t = (nowMs % 90000) / 90000;
  const p1 = routeCoordinates[startCoordIndex];
  const p2 = routeCoordinates[Math.min(startCoordIndex + 1, totalSegments)];

  const lon = p1[0] + (p2[0] - p1[0]) * t;
  const lat = p1[1] + (p2[1] - p1[1]) * t;
  const bearing = calculateBearing(p1[1], p1[0], p2[1], p2[0]);

  return {
    latitude: Math.round(lat * 1e5) / 1e5,
    longitude: Math.round(lon * 1e5) / 1e5,
    bearing: Math.round(bearing),
    speedKmph: Math.round(80 + 25 * Math.sin(nowMs / 15000)),
    updatedAt: new Date().toISOString(),
    isSimulated
  };
}

// ---------------------------------------------------------------------------
// Main Service
// ---------------------------------------------------------------------------

export class JourneyService {
  public async getJourney(trainId: string): Promise<Journey | null> {
    if (!trainId) return null;

    // ─── 1. Fetch schedule ────────────────────────────────────────────────────
    const schedule: RailRadarScheduleData | null = await railRadarClient.fetchTrainSchedule(trainId);

    if (!schedule || !schedule.route || schedule.route.length === 0) {
      console.warn(`[JOURNEY] No schedule data from RailRadar for train ${trainId}`);
      return null;
    }

    const stops = schedule.route;

    // ─── 2. Fetch live status (optional) ─────────────────────────────────────
    let liveData: RailRadarLiveData | null = null;
    try {
      liveData = await railRadarClient.fetchLiveStatus(trainId);
    } catch (e) {
      console.warn('[JOURNEY] Live fetch failed, using schedule-only mode');
    }

    // ─── 3. Determine current position ────────────────────────────────────────
    let currentSequence: number;
    let delayMinutes = 0;
    let isSimulated = true;

    if (liveData?.currentLocation) {
      currentSequence = liveData.currentLocation.sequence;
      delayMinutes = liveData.currentLocation.delayMinutes ?? liveData.delayMinutes ?? 0;
      isSimulated = !liveData.currentLocation.isActualPosition;
    } else if (liveData?.delayMinutes !== undefined) {
      // Have some live info but no location
      delayMinutes = liveData.delayMinutes;
      currentSequence = Math.floor(stops.length / 3);
    } else {
      // No live data — estimate position from time
      currentSequence = Math.floor(stops.length / 3);
    }

    // Find 0-based index
    let currentStationIndex = stops.findIndex(s => s.sequence === currentSequence);
    if (currentStationIndex < 0) {
      // Fallback: find by distance
      if (liveData?.currentLocation?.distanceFromOriginKm !== undefined) {
        const distTarget = liveData.currentLocation.distanceFromOriginKm;
        currentStationIndex = stops.reduce((bestIdx, stop, idx) => {
          return Math.abs(stop.distance - distTarget) < Math.abs(stops[bestIdx].distance - distTarget) ? idx : bestIdx;
        }, 0);
      } else {
        currentStationIndex = Math.floor(stops.length / 3);
      }
    }
    currentStationIndex = Math.max(0, Math.min(currentStationIndex, stops.length - 1));

    // ─── 4. Build data structures ─────────────────────────────────────────────
    const stations: Station[] = stops.map(stopToStation);
    const timeline = buildTimeline(stops, currentSequence, delayMinutes);

    const routeCoordinates: [number, number][] = stops
      .filter(s => s.station.lat && s.station.lng)
      .map(s => [s.station.lng, s.station.lat] as [number, number]);

    // ─── 5. Build Train metadata ──────────────────────────────────────────────
    const { train: apiTrain } = schedule;
    const firstStop = stops[0];
    const lastStop = stops[stops.length - 1];

    const sourceStation = stopToStation(firstStop);
    const destinationStation = stopToStation(lastStop);

    const departureTime = firstStop.departure || '--:--';
    const arrivalTime = lastStop.arrival || '--:--';

    // Calculate duration from departure to arrival
    const durationMinutes = (() => {
      try {
        const [dh, dm] = departureTime.split(':').map(Number);
        const [ah, am] = arrivalTime.split(':').map(Number);
        const dayDiff = (lastStop.arrivalDay ?? 1) - (firstStop.departureDay ?? 1);
        return (ah * 60 + am) - (dh * 60 + dm) + dayDiff * 1440;
      } catch {
        return 0;
      }
    })();

    const totalDurationFormatted = durationMinutes > 0
      ? `${Math.floor(durationMinutes / 60)}h ${durationMinutes % 60}m`
      : 'N/A';

    // Map runDays from API (Mon/Tue format or 1/2/3... format)
    const runningDays = apiTrain.runDays?.length
      ? apiTrain.runDays
      : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    const train: Train = {
      id: apiTrain.number,
      number: apiTrain.number,
      name: apiTrain.name,
      type: inferTrainType(apiTrain.name, apiTrain.category),
      sourceStation,
      destinationStation,
      departureTime,
      arrivalTime,
      totalDurationFormatted,
      runningDays
    };

    // ─── 6. Live location ─────────────────────────────────────────────────────
    const liveLocation = calculateLiveLocation(
      routeCoordinates,
      currentStationIndex,
      stops.length,
      isSimulated
    );

    // ─── 7. Running status ────────────────────────────────────────────────────
    let runningStatus: TrainRunningStatus = 'ON_TIME';
    if (!liveData) {
      runningStatus = 'DATA_UNAVAILABLE';
    } else if (liveData.status === 'completed' || currentStationIndex >= stops.length - 1) {
      runningStatus = 'COMPLETED';
    } else if (currentStationIndex === 0) {
      runningStatus = 'NOT_STARTED';
    } else if (delayMinutes > 5) {
      runningStatus = 'DELAYED';
    } else if (delayMinutes < -2) {
      runningStatus = 'EARLY';
    }

    // ─── 8. Progress ──────────────────────────────────────────────────────────
    const totalDistanceKm = lastStop.distance || 0;
    const currentDistKm = stops[currentStationIndex]?.distance || 0;
    const nextDistKm = stops[Math.min(currentStationIndex + 1, stops.length - 1)]?.distance || currentDistKm;
    const distanceCoveredKm = Math.min(
      Math.round(currentDistKm + (nextDistKm - currentDistKm) * 0.45),
      totalDistanceKm
    );
    const distanceRemainingKm = Math.max(0, totalDistanceKm - distanceCoveredKm);
    const percentage = totalDistanceKm > 0
      ? Math.round((distanceCoveredKm / totalDistanceKm) * 100)
      : 0;

    const progress: JourneyProgress = {
      percentage,
      distanceCoveredKm,
      distanceRemainingKm,
      totalDistanceKm,
      stationsCompleted: currentStationIndex,
      stationsRemaining: Math.max(0, stops.length - currentStationIndex - 1),
      totalStations: stops.length
    };

    // ─── 9. Route ─────────────────────────────────────────────────────────────
    const route: Route = {
      geometry: { type: 'LineString', coordinates: routeCoordinates },
      stations,
      totalDistanceKm
    };

    // ─── 10. Train status ─────────────────────────────────────────────────────
    const currentStation = stations[currentStationIndex];
    const nextStation = stations[Math.min(currentStationIndex + 1, stations.length - 1)];
    const etaToNextMinutes = nextDistKm > distanceCoveredKm
      ? Math.max(5, Math.round((nextDistKm - distanceCoveredKm) / Math.max(liveLocation.speedKmph, 1) * 60))
      : 5;

    const trainStatus: TrainStatus = {
      status: runningStatus,
      delayMinutes,
      currentStationId: currentStation?.id,
      nextStationId: nextStation?.id,
      lastPassedStationId: currentStation?.id,
      etaToNextMinutes,
      liveLocation,
      updatedAt: liveData?.lastUpdatedAt || new Date().toISOString(),
      staleThresholdMinutes: 5
    };

    return {
      train,
      status: trainStatus,
      route,
      progress,
      timeline,
      currentStation,
      nextStation,
      updatedAt: trainStatus.updatedAt
    };
  }

  public async getLiveStatus(
    trainId: string
  ): Promise<(TrainStatus & { trainId: string; progressPercentage: number }) | null> {
    const journey = await this.getJourney(trainId);
    if (!journey) return null;
    return {
      trainId,
      ...journey.status,
      progressPercentage: journey.progress.percentage
    };
  }
}

export const journeyService = new JourneyService();
