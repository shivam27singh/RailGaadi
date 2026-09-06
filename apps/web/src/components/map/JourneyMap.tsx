import React, { useEffect, useRef, useState, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import {
  Maximize2,
  Minimize2,
  Navigation,
  Compass,
  Plus,
  Minus,
  Crosshair,
  Layers
} from 'lucide-react';
import { Journey, Station } from '@railgaddi/types';
import { interpolateTrainPosition } from '@railgaddi/utils';

interface JourneyMapProps {
  journey: Journey;
  heightClass?: string;
  onSelectStation?: (station: Station) => void;
}

const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_API_KEY || '';

// High-resolution MapTiler cartographic styles with reliable fallback
const getBasemapStyle = () => {
  if (MAPTILER_KEY) {
    return `https://api.maptiler.com/maps/dataviz-dark/style.json?key=${MAPTILER_KEY}`;
  }
  return 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';
};

export const JourneyMap: React.FC<JourneyMapProps> = ({
  journey,
  heightClass = 'h-[500px] lg:h-[620px]',
  onSelectStation
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const trainMarkerRef = useRef<maplibregl.Marker | null>(null);
  const stationMarkersRef = useRef<maplibregl.Marker[]>([]);

  // Smooth animation ref for train position lerp
  const currentCoordRef = useRef<{ latitude: number; longitude: number; bearing: number }>({
    latitude: journey.status.liveLocation.latitude,
    longitude: journey.status.liveLocation.longitude,
    bearing: journey.status.liveLocation.bearing
  });
  const targetCoordRef = useRef<{ latitude: number; longitude: number; bearing: number }>({
    latitude: journey.status.liveLocation.latitude,
    longitude: journey.status.liveLocation.longitude,
    bearing: journey.status.liveLocation.bearing
  });
  const animFrameIdRef = useRef<number | null>(null);

  const [isFollowing, setIsFollowing] = useState(true);
  const [isPitch3D, setIsPitch3D] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);

  const { route, status, timeline } = journey;
  const { liveLocation } = status;

  // Initialize MapLibre
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: getBasemapStyle(),
      center: [liveLocation.longitude, liveLocation.latitude],
      zoom: 6.8,
      pitch: 0,
      bearing: 0,
      attributionControl: false
    });

    mapRef.current = map;

    // Detect user manual interaction to pause follow mode
    const handleUserInteraction = () => {
      setIsFollowing(false);
    };

    map.on('dragstart', handleUserInteraction);
    map.on('touchstart', handleUserInteraction);
    map.on('wheel', handleUserInteraction);

    map.on('load', () => {
      setMapLoaded(true);
      // Fit bounds initially to show the train and surrounding route
      if (route.geometry.coordinates.length > 0) {
        const bounds = new maplibregl.LngLatBounds();
        route.geometry.coordinates.forEach((coord) => bounds.extend(coord));
        map.fitBounds(bounds, { padding: 60, maxZoom: 10 });
      }
    });

    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      map.remove();
      mapRef.current = null;
    };
  }, []);

  const prevTrainIdRef = useRef<string>(journey.train.id);

  // Re-fit camera and reset coordinates when a new train is selected
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    if (prevTrainIdRef.current !== journey.train.id) {
      prevTrainIdRef.current = journey.train.id;

      currentCoordRef.current = {
        latitude: liveLocation.latitude,
        longitude: liveLocation.longitude,
        bearing: liveLocation.bearing
      };
      targetCoordRef.current = {
        latitude: liveLocation.latitude,
        longitude: liveLocation.longitude,
        bearing: liveLocation.bearing
      };

      if (trainMarkerRef.current) {
        trainMarkerRef.current.setLngLat([liveLocation.longitude, liveLocation.latitude]);
      }

      if (route.geometry.coordinates.length > 0) {
        const bounds = new maplibregl.LngLatBounds();
        route.geometry.coordinates.forEach((coord) => bounds.extend(coord));
        map.fitBounds(bounds, { padding: 60, maxZoom: 10, duration: 1200 });
      }
    }
  }, [journey.train.id, mapLoaded, liveLocation, route.geometry.coordinates]);

  // Update Route Layers when map is ready or route changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    const allCoords = route.geometry.coordinates;

    // Find the coordinate index closest to current train position
    let closestIndex = 0;
    let minDistance = Infinity;
    allCoords.forEach((c, idx) => {
      const dist = Math.hypot(c[0] - liveLocation.longitude, c[1] - liveLocation.latitude);
      if (dist < minDistance) {
        minDistance = dist;
        closestIndex = idx;
      }
    });

    const completedCoords = [
      ...allCoords.slice(0, closestIndex + 1),
      [liveLocation.longitude, liveLocation.latitude] as [number, number]
    ];
    const remainingCoords = [
      [liveLocation.longitude, liveLocation.latitude] as [number, number],
      ...allCoords.slice(closestIndex + 1)
    ];

    // 1. Full Track Bed Layer (Subtle dark ballast)
    if (!map.getSource('track-bed-source')) {
      map.addSource('track-bed-source', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: allCoords
          }
        }
      });

      map.addLayer({
        id: 'track-bed-layer',
        type: 'line',
        source: 'track-bed-source',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#1E2330',
          'line-width': 8,
          'line-opacity': 0.9
        }
      });
    } else {
      (map.getSource('track-bed-source') as maplibregl.GeoJSONSource).setData({
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: allCoords
        }
      });
    }

    // 2. Completed Route Glow
    if (!map.getSource('completed-glow-source')) {
      map.addSource('completed-glow-source', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: completedCoords
          }
        }
      });

      map.addLayer({
        id: 'completed-glow-layer',
        type: 'line',
        source: 'completed-glow-source',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#3B82F6',
          'line-width': 10,
          'line-blur': 6,
          'line-opacity': 0.4
        }
      });

      map.addLayer({
        id: 'completed-line-layer',
        type: 'line',
        source: 'completed-glow-source',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#60A5FA',
          'line-width': 4.5
        }
      });
    } else {
      (map.getSource('completed-glow-source') as maplibregl.GeoJSONSource).setData({
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: completedCoords
        }
      });
    }

    // 3. Remaining Route (Dashed futuristic rail route)
    if (!map.getSource('remaining-route-source')) {
      map.addSource('remaining-route-source', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: remainingCoords
          }
        }
      });

      map.addLayer({
        id: 'remaining-line-layer',
        type: 'line',
        source: 'remaining-route-source',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#475569',
          'line-width': 3,
          'line-dasharray': [2, 2.5],
          'line-opacity': 0.8
        }
      });
    } else {
      (map.getSource('remaining-route-source') as maplibregl.GeoJSONSource).setData({
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: remainingCoords
        }
      });
    }
  }, [mapLoaded, route, liveLocation.latitude, liveLocation.longitude]);

  // Update Station Markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    // Remove existing station markers
    stationMarkersRef.current.forEach((m) => m.remove());
    stationMarkersRef.current = [];

    route.stations.forEach((station) => {
      const timelineItem = timeline.find((t) => t.station.id === station.id);
      const isCompleted = timelineItem?.status === 'COMPLETED';
      const isCurrent = timelineItem?.status === 'CURRENT' || station.id === status.currentStationId;

      // Custom Station Marker DOM element
      const el = document.createElement('div');
      el.className = 'station-marker group cursor-pointer';

      let markerHtml = '';
      if (isCurrent) {
        markerHtml = `
          <div class="relative flex items-center justify-center">
            <span class="animate-ping absolute inline-flex h-7 w-7 rounded-full bg-brand-500 opacity-60"></span>
            <div class="relative w-5 h-5 rounded-full bg-brand-500 border-2 border-white shadow-glow-sm flex items-center justify-center">
              <span class="w-1.5 h-1.5 rounded-full bg-white"></span>
            </div>
          </div>
        `;
      } else if (isCompleted) {
        markerHtml = `
          <div class="w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-slate-900 shadow-sm hover:scale-125 transition-transform"></div>
        `;
      } else {
        markerHtml = `
          <div class="w-3.5 h-3.5 rounded-full bg-slate-600 border-2 border-slate-900 shadow-sm hover:scale-125 hover:bg-slate-400 transition-transform"></div>
        `;
      }

      el.innerHTML = markerHtml;

      // Popup with station details
      const popup = new maplibregl.Popup({ offset: 12, closeButton: false }).setHTML(`
        <div class="p-1">
          <div class="font-bold text-sm text-white flex items-center justify-between gap-3">
            <span>${station.name}</span>
            <span class="text-xs font-mono text-brand-400 px-1.5 py-0.5 rounded bg-white/5">${station.code}</span>
          </div>
          <div class="text-xs text-slate-400 mt-1">
            ${timelineItem?.scheduledArrival === 'Source' ? 'Origin Station' : `Sch: ${timelineItem?.scheduledArrival || '--'}`}
            ${timelineItem?.scheduledDeparture !== 'Destination' ? ` · Dep: ${timelineItem?.scheduledDeparture || '--'}` : ' · Terminus'}
          </div>
          <div class="text-[11px] text-slate-500 mt-0.5">
            Platform ${timelineItem?.platform || '1'} · ${timelineItem?.distanceFromOriginKm || 0} km
          </div>
        </div>
      `);

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([station.longitude, station.latitude])
        .setPopup(popup)
        .addTo(map);

      el.addEventListener('click', () => {
        if (onSelectStation) onSelectStation(station);
      });

      stationMarkersRef.current.push(marker);
    });
  }, [mapLoaded, route.stations, timeline, status.currentStationId, onSelectStation]);

  // Train Marker Smooth Animation (Lerp)
  useEffect(() => {
    targetCoordRef.current = {
      latitude: liveLocation.latitude,
      longitude: liveLocation.longitude,
      bearing: liveLocation.bearing
    };

    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    // Create train marker DOM element if not exists
    if (!trainMarkerRef.current) {
      const el = document.createElement('div');
      el.className = 'train-marker select-none';
      el.innerHTML = `
        <div class="relative flex items-center justify-center">
          <div class="absolute w-12 h-12 rounded-full bg-amber-500/30 animate-train-ping"></div>
          <div class="absolute w-8 h-8 rounded-full bg-amber-500/40 blur-[2px]"></div>
          <div id="train-bearing-arrow" class="relative w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-amber-400 border-2 border-white shadow-glow-amber flex items-center justify-center text-slate-950 transition-transform duration-300">
            <svg class="w-4 h-4 text-slate-950" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="12 2 19 21 12 17 5 21 12 2"></polygon>
            </svg>
          </div>
        </div>
      `;

      trainMarkerRef.current = new maplibregl.Marker({ element: el })
        .setLngLat([currentCoordRef.current.longitude, currentCoordRef.current.latitude])
        .addTo(map);
    }

    // Smooth lerp loop
    const animate = () => {
      const cur = currentCoordRef.current;
      const tar = targetCoordRef.current;

      const next = interpolateTrainPosition(cur, tar, 0.08);
      currentCoordRef.current = next;

      if (trainMarkerRef.current) {
        trainMarkerRef.current.setLngLat([next.longitude, next.latitude]);

        const arrow = document.getElementById('train-bearing-arrow');
        if (arrow) {
          arrow.style.transform = `rotate(${next.bearing}deg)`;
        }
      }

      // If follow mode is enabled, pan camera
      if (isFollowing && mapRef.current) {
        mapRef.current.panTo([next.longitude, next.latitude], {
          duration: 300,
          easing: (t) => t
        });
      }

      const diffLat = Math.abs(tar.latitude - next.latitude);
      const diffLon = Math.abs(tar.longitude - next.longitude);

      if (diffLat > 0.00001 || diffLon > 0.00001) {
        animFrameIdRef.current = requestAnimationFrame(animate);
      }
    };

    if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    animFrameIdRef.current = requestAnimationFrame(animate);

    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, [liveLocation.latitude, liveLocation.longitude, liveLocation.bearing, mapLoaded, isFollowing]);

  // Handle Controls: Zoom In / Out
  const handleZoomIn = () => mapRef.current?.zoomIn();
  const handleZoomOut = () => mapRef.current?.zoomOut();

  // Recenter and follow
  const handleRecenter = useCallback(() => {
    setIsFollowing(true);
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [liveLocation.longitude, liveLocation.latitude],
        zoom: 8.5,
        speed: 1.2
      });
    }
  }, [liveLocation.longitude, liveLocation.latitude]);

  // 3D Perspective Tilt toggle (Apple Maps 3D style)
  const toggle3D = () => {
    const nextPitch = isPitch3D ? 0 : 50;
    setIsPitch3D(!isPitch3D);
    if (mapRef.current) {
      mapRef.current.easeTo({
        pitch: nextPitch,
        bearing: isPitch3D ? 0 : liveLocation.bearing,
        duration: 800
      });
    }
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!mapContainerRef.current) return;
    if (!isFullscreen) {
      if (mapContainerRef.current.requestFullscreen) {
        mapContainerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div
      className={`relative w-full ${heightClass} rounded-2xl overflow-hidden glass-panel border border-white/10 shadow-2xl mb-4 group`}
    >
      {/* Map Container */}
      <div ref={mapContainerRef} className="w-full h-full bg-[#08090C]" />

      {/* Floating Header Tag */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
        <div className="px-3 py-1.5 rounded-xl glass-panel text-xs font-semibold text-white flex items-center gap-2 shadow-lg border border-white/10 backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span>Live Satellite Track</span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-300 font-mono">{liveLocation.speedKmph} km/h</span>
        </div>
      </div>

      {/* Follow Train Floating Pill (Appears when user manually panned away) */}
      {!isFollowing && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 animate-in fade-in zoom-in-95 duration-200">
          <button
            onClick={handleRecenter}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-glow-md border border-brand-400/40 backdrop-blur-md transition-all active:scale-95"
          >
            <Crosshair className="w-3.5 h-3.5 animate-spin text-brand-200" />
            <span>Follow Train</span>
          </button>
        </div>
      )}

      {/* Map Interactive Controls Panel */}
      <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-2">
        {/* Recenter / Focus */}
        <button
          onClick={handleRecenter}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-lg border backdrop-blur-md ${
            isFollowing
              ? 'bg-brand-600 text-white border-brand-500/40 shadow-glow-sm'
              : 'bg-surface/80 hover:bg-surface text-slate-300 border-white/10 hover:text-white'
          }`}
          title="Center on Train"
        >
          <Navigation className={`w-4 h-4 ${isFollowing ? 'rotate-45 text-white' : ''}`} />
        </button>

        {/* 3D Tilt perspective */}
        <button
          onClick={toggle3D}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-lg border backdrop-blur-md ${
            isPitch3D
              ? 'bg-brand-600 text-white border-brand-500/40'
              : 'bg-surface/80 hover:bg-surface text-slate-300 border-white/10 hover:text-white'
          }`}
          title="Toggle 3D Perspective Tilt"
        >
          <span className="text-[11px] font-bold font-mono">3D</span>
        </button>

        {/* Zoom In / Out Group */}
        <div className="flex flex-col rounded-xl overflow-hidden glass-panel border border-white/10 shadow-lg">
          <button
            onClick={handleZoomIn}
            className="w-10 h-9 flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 transition border-b border-white/10"
            title="Zoom in"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            className="w-10 h-9 flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 transition"
            title="Zoom out"
          >
            <Minus className="w-4 h-4" />
          </button>
        </div>

        {/* Fullscreen */}
        <button
          onClick={toggleFullscreen}
          className="w-10 h-10 rounded-xl flex items-center justify-center bg-surface/80 hover:bg-surface text-slate-300 hover:text-white border border-white/10 shadow-lg backdrop-blur-md transition"
          title="Toggle Fullscreen"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Bottom Left Legend */}
      <div className="absolute bottom-4 left-4 z-10 hidden sm:flex items-center gap-3 px-3 py-1.5 rounded-xl glass-panel text-[11px] text-slate-400 border border-white/10 backdrop-blur-md">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-1 rounded-full bg-blue-500 shadow-glow-sm" />
          <span>Covered</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-1 border-t-2 border-dashed border-slate-500" />
          <span>Remaining</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          <span>Train</span>
        </div>
        <span className="text-slate-600">|</span>
        <span className="text-[10px] text-slate-500 font-medium">MapTiler Dark</span>
      </div>
    </div>
  );
};
