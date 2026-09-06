/**
 * PlacesService — dynamic nearby places via Overpass API (OpenStreetMap).
 * Fetches nearby geographic features along the route for any train.
 */

import { NearbyPlacesResponse, NearbyPlace, NearbyFeatureType } from '@railgaddi/types';
import { railRadarClient } from '../providers/railradar/client.js';

const CACHE = new Map<string, { data: NearbyPlacesResponse; cachedAt: number }>();
const TTL = 24 * 60 * 60 * 1000; // 24 hours — OSM data is stable

const EMPTY_RESPONSE: NearbyPlacesResponse = {
  rivers: [], lakes: [], mountains: [], bridges: [],
  tunnels: [], monuments: [], cities: []
};

interface OverpassElement {
  id: number;
  type: string;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

function toNearbyPlace(
  el: OverpassElement,
  category: NearbyFeatureType,
  nearStation: string,
  distKm: number
): NearbyPlace | null {
  const lat = el.lat ?? el.center?.lat;
  const lon = el.lon ?? el.center?.lon;
  if (!lat || !lon) return null;

  const name = el.tags?.name || el.tags?.['name:en'] || 'Unknown Feature';
  const description = el.tags?.description || el.tags?.['wikipedia'] || el.tags?.type || category.toLowerCase();

  return {
    id: String(el.id),
    name,
    category,
    description,
    latitude: lat,
    longitude: lon,
    distanceFromTrackKm: Math.round(distKm * 10) / 10,
    nearStationName: nearStation
  };
}

async function queryOverpass(query: string): Promise<OverpassElement[]> {
  try {
    const res = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `data=${encodeURIComponent(query)}`,
      signal: AbortSignal.timeout(12000)
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.elements || [];
  } catch {
    return [];
  }
}

export class PlacesService {
  public async getNearbyPlacesForTrain(trainId: string): Promise<NearbyPlacesResponse | null> {
    // Check cache
    const cached = CACHE.get(trainId);
    if (cached && Date.now() - cached.cachedAt < TTL) {
      return cached.data;
    }

    // Fetch schedule for route coordinates
    const schedule = await railRadarClient.fetchTrainSchedule(trainId);
    if (!schedule || !schedule.route.length) return EMPTY_RESPONSE;

    const stops = schedule.route;

    // Use a few key stops to query Overpass (avoid too-large bounding boxes)
    // Pick source, 1/4, 1/2, 3/4, destination
    const keyIndices = [
      0,
      Math.floor(stops.length * 0.25),
      Math.floor(stops.length * 0.5),
      Math.floor(stops.length * 0.75),
      stops.length - 1
    ];
    const keyStops = keyIndices.map(i => stops[i]).filter(Boolean);

    const result: NearbyPlacesResponse = {
      rivers: [], lakes: [], mountains: [], bridges: [],
      tunnels: [], monuments: [], cities: [], featuredCrossing: undefined
    };

    // Query Overpass for each key stop's vicinity (10km radius)
    await Promise.allSettled(
      keyStops.map(async (stop) => {
        const { lat, lng, name: stationName } = { lat: stop.station.lat, lng: stop.station.lng, name: stop.station.name };
        const r = 8000; // 8km radius in metres

        const query = `
[out:json][timeout:10];
(
  way["waterway"="river"](around:${r},${lat},${lng});
  node["natural"="peak"](around:${r},${lat},${lng});
  way["bridge"="yes"]["railway"](around:${r},${lat},${lng});
  node["historic"="monument"](around:${r},${lat},${lng});
  node["tourism"="attraction"](around:${r},${lat},${lng});
  node["place"="city"](around:${r},${lat},${lng});
);
out center tags;`;

        const elements = await queryOverpass(query);

        elements.forEach(el => {
          const tags = el.tags || {};
          const elLat = el.lat ?? el.center?.lat ?? lat;
          const elLon = el.lon ?? el.center?.lon ?? lng;
          const distKm = haversine(lat, lng, elLat, elLon);

          if (tags.waterway === 'river') {
            const place = toNearbyPlace(el, 'RIVER', stationName, distKm);
            if (place && result.rivers.length < 5) result.rivers.push(place);
          } else if (tags.natural === 'peak') {
            const place = toNearbyPlace(el, 'MOUNTAIN', stationName, distKm);
            if (place && result.mountains.length < 5) result.mountains.push(place);
          } else if (tags.bridge === 'yes') {
            const place = toNearbyPlace(el, 'BRIDGE', stationName, distKm);
            if (place && result.bridges.length < 5) result.bridges.push(place);
          } else if (tags.historic === 'monument' || tags.tourism === 'attraction') {
            const place = toNearbyPlace(el, 'MONUMENT', stationName, distKm);
            if (place && result.monuments.length < 8) result.monuments.push(place);
          } else if (tags.place === 'city') {
            const place = toNearbyPlace(el, 'CITY', stationName, distKm);
            if (place && result.cities.length < 8) result.cities.push(place);
          }
        });
      })
    );

    // Set featured crossing to first bridge or first river
    result.featuredCrossing = result.bridges[0] ?? result.rivers[0];

    CACHE.set(trainId, { data: result, cachedAt: Date.now() });
    return result;
  }
}

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export const placesService = new PlacesService();
