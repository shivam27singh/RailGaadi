/**
 * TrainService — fully dynamic via RailRadar API.
 * Correct API: schedule endpoint returns data.train + data.route[]
 */

import { TrainSearchResult, Train } from '@railgaddi/types';
import { railRadarClient } from '../providers/railradar/client.js';

function inferTrainType(name: string, category?: string): string {
  if (category) {
    const catMap: Record<string, string> = {
      'Rajdhani': 'Rajdhani Express',
      'Shatabdi': 'Shatabdi Express',
      'Vande Bharat': 'Vande Bharat Express',
      'Duronto': 'Duronto Express',
      'Tejas': 'Tejas Express',
      'Humsafar': 'Humsafar Express',
      'Garib Rath': 'Garib Rath'
    };
    if (catMap[category]) return catMap[category];
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
  if (n.includes('express') || n.includes('exp')) return 'Superfast Express';
  if (n.includes('mail')) return 'Mail Express';
  return 'Express';
}

export class TrainService {
  public async searchTrains(query: string): Promise<TrainSearchResult[]> {
    const cleanQuery = (query || '').trim();
    if (!cleanQuery) return [];

    try {
      const raw = await railRadarClient.searchTrains(cleanQuery);
      return raw.slice(0, 10).map(r => ({
        id: r.trainNumber,
        number: r.trainNumber,
        name: r.trainName,
        type: inferTrainType(r.trainName, r.trainType),
        sourceStation: r.source
          ? { id: r.source.code, code: r.source.code, name: r.source.name, latitude: r.source.lat, longitude: r.source.lng }
          : { id: 'UNKNOWN', code: '???', name: 'Unknown', latitude: 0, longitude: 0 },
        destinationStation: r.destination
          ? { id: r.destination.code, code: r.destination.code, name: r.destination.name, latitude: r.destination.lat, longitude: r.destination.lng }
          : { id: 'UNKNOWN', code: '???', name: 'Unknown', latitude: 0, longitude: 0 },
        departureTime: r.departureTime || '--:--',
        arrivalTime: r.arrivalTime || '--:--'
      }));
    } catch (err: any) {
      console.warn('[TRAIN SERVICE] searchTrains failed:', err.message);
      return [];
    }
  }

  public async getTrainById(trainId: string): Promise<Train | null> {
    try {
      const schedule = await railRadarClient.fetchTrainSchedule(trainId);
      // Correct: schedule.route is the stops array (not schedule.schedule)
      if (!schedule || !schedule.route || schedule.route.length === 0) return null;

      const stops = schedule.route;
      const apiTrain = schedule.train;
      const first = stops[0];
      const last = stops[stops.length - 1];

      return {
        id: apiTrain.number,
        number: apiTrain.number,
        name: apiTrain.name,
        type: inferTrainType(apiTrain.name, apiTrain.category),
        sourceStation: {
          id: first.station.code,
          code: first.station.code,
          name: first.station.name,
          latitude: first.station.lat,
          longitude: first.station.lng
        },
        destinationStation: {
          id: last.station.code,
          code: last.station.code,
          name: last.station.name,
          latitude: last.station.lat,
          longitude: last.station.lng
        },
        departureTime: first.departure || '--:--',
        arrivalTime: last.arrival || '--:--',
        totalDurationFormatted: 'N/A',
        runningDays: apiTrain.runDays ?? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      };
    } catch (err: any) {
      console.warn('[TRAIN SERVICE] getTrainById failed:', err.message);
      return null;
    }
  }
}

export const trainService = new TrainService();
