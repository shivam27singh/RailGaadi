import { TrainRunningStatus } from '@railgaddi/types';

/**
 * Calculates Great Circle distance between two coordinates in kilometers (Haversine formula).
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Calculates initial compass bearing from (lat1, lon1) to (lat2, lon2) in degrees (0-360).
 */
export function calculateBearing(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const y = Math.sin(toRad(lon2 - lon1)) * Math.cos(toRad(lat2));
  const x =
    Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
    Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(toRad(lon2 - lon1));
  const bearing = (Math.atan2(y, x) * 180) / Math.PI;
  return (bearing + 360) % 360;
}

/**
 * Linear interpolation (lerp) between two coordinates for smooth train animation.
 */
export function interpolateTrainPosition(
  current: { latitude: number; longitude: number },
  target: { latitude: number; longitude: number },
  factor: number
): { latitude: number; longitude: number; bearing: number } {
  const clampedFactor = Math.max(0, Math.min(1, factor));
  const latitude = current.latitude + (target.latitude - current.latitude) * clampedFactor;
  const longitude = current.longitude + (target.longitude - current.longitude) * clampedFactor;
  const bearing = calculateBearing(current.latitude, current.longitude, target.latitude, target.longitude);

  return { latitude, longitude, bearing };
}

/**
 * Formats distance in km with nice separators.
 */
export function formatDistance(distanceKm: number): string {
  if (distanceKm == null || isNaN(distanceKm)) return '0 km';
  return `${Math.round(distanceKm).toLocaleString('en-IN')} km`;
}

/**
 * Formats minutes into human-readable delay text.
 */
export function formatDelay(delayMinutes: number): {
  text: string;
  isDelayed: boolean;
  isEarly: boolean;
  isOnTime: boolean;
} {
  if (!delayMinutes || delayMinutes === 0) {
    return { text: 'On Time', isDelayed: false, isEarly: false, isOnTime: true };
  }
  if (delayMinutes > 0) {
    const hours = Math.floor(delayMinutes / 60);
    const mins = delayMinutes % 60;
    const text = hours > 0 ? `+${hours}h ${mins}m Late` : `+${mins}m Late`;
    return { text, isDelayed: true, isEarly: false, isOnTime: false };
  }
  const earlyMins = Math.abs(delayMinutes);
  return { text: `${earlyMins}m Early`, isDelayed: false, isEarly: true, isOnTime: false };
}

/**
 * Formats minutes into human-readable ETA (e.g. "1h 45m" or "25m").
 */
export function formatETA(minutes?: number): string {
  if (minutes == null || minutes < 0 || isNaN(minutes)) return '--';
  if (minutes === 0) return 'Arriving now';
  const hours = Math.floor(minutes / 60);
  const remainingMins = Math.round(minutes % 60);
  if (hours > 0) {
    return `${hours}h ${remainingMins}m`;
  }
  return `${remainingMins}m`;
}

/**
 * Formats duration in ISO or minutes into "16h 50m".
 */
export function formatDuration(durationMinutes: number): string {
  if (!durationMinutes || isNaN(durationMinutes)) return '0m';
  const hours = Math.floor(durationMinutes / 60);
  const mins = Math.round(durationMinutes % 60);
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m`;
}

/**
 * Formats ISO timestamp into friendly relative time like "Updated 38s ago" or "2m ago".
 */
export function formatLastUpdated(isoDateString: string): {
  label: string;
  isStale: boolean;
  secondsAgo: number;
} {
  try {
    const then = new Date(isoDateString).getTime();
    const now = Date.now();
    const diffSeconds = Math.max(0, Math.floor((now - then) / 1000));

    if (diffSeconds < 5) {
      return { label: 'Updated just now', isStale: false, secondsAgo: diffSeconds };
    }
    if (diffSeconds < 60) {
      return { label: `Updated ${diffSeconds}s ago`, isStale: false, secondsAgo: diffSeconds };
    }
    const mins = Math.floor(diffSeconds / 60);
    const isStale = mins >= 5;
    if (isStale) {
      return { label: `Live data delayed · Last update ${mins}m ago`, isStale: true, secondsAgo: diffSeconds };
    }
    return { label: `Updated ${mins}m ago`, isStale: false, secondsAgo: diffSeconds };
  } catch {
    return { label: 'Updated recently', isStale: false, secondsAgo: 0 };
  }
}

/**
 * Get human-readable badge configuration for running status.
 */
export function getStatusConfig(status: TrainRunningStatus, delayMinutes: number = 0): {
  label: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
  dotColor: string;
  glowColor: string;
} {
  switch (status) {
    case 'ON_TIME':
      return {
        label: 'ON TIME',
        bgColor: 'bg-emerald-500/10',
        textColor: 'text-emerald-400',
        borderColor: 'border-emerald-500/30',
        dotColor: 'bg-emerald-400',
        glowColor: 'shadow-emerald-500/20',
      };
    case 'EARLY':
      return {
        label: 'EARLY',
        bgColor: 'bg-cyan-500/10',
        textColor: 'text-cyan-400',
        borderColor: 'border-cyan-500/30',
        dotColor: 'bg-cyan-400',
        glowColor: 'shadow-cyan-500/20',
      };
    case 'DELAYED':
      return {
        label: `DELAYED ${delayMinutes > 0 ? `+${delayMinutes}m` : ''}`.trim(),
        bgColor: 'bg-amber-500/10',
        textColor: 'text-amber-400',
        borderColor: 'border-amber-500/30',
        dotColor: 'bg-amber-400',
        glowColor: 'shadow-amber-500/20',
      };
    case 'ARRIVING':
      return {
        label: 'ARRIVING NOW',
        bgColor: 'bg-indigo-500/10',
        textColor: 'text-indigo-400',
        borderColor: 'border-indigo-500/30',
        dotColor: 'bg-indigo-400',
        glowColor: 'shadow-indigo-500/20',
      };
    case 'ARRIVED':
    case 'COMPLETED':
      return {
        label: 'JOURNEY COMPLETED',
        bgColor: 'bg-blue-500/10',
        textColor: 'text-blue-400',
        borderColor: 'border-blue-500/30',
        dotColor: 'bg-blue-400',
        glowColor: 'shadow-blue-500/20',
      };
    case 'NOT_STARTED':
      return {
        label: 'NOT STARTED',
        bgColor: 'bg-zinc-500/10',
        textColor: 'text-zinc-400',
        borderColor: 'border-zinc-500/30',
        dotColor: 'bg-zinc-400',
        glowColor: 'shadow-zinc-500/10',
      };
    case 'DATA_UNAVAILABLE':
    default:
      return {
        label: 'LIVE DATA UNAVAILABLE',
        bgColor: 'bg-rose-500/10',
        textColor: 'text-rose-400',
        borderColor: 'border-rose-500/30',
        dotColor: 'bg-rose-400',
        glowColor: 'shadow-rose-500/20',
      };
  }
}
