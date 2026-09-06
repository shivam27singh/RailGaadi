import React from 'react';
import { Compass, Waves, Mountain, Landmark, Building2, Eye, ShieldAlert } from 'lucide-react';
import { NearbyPlacesResponse, NearbyPlace } from '@railgaddi/types';
import { Card } from '../ui/Card';

interface NearbyPlacesProps {
  places: NearbyPlacesResponse | undefined;
  isLoading?: boolean;
}

export const NearbyPlaces: React.FC<NearbyPlacesProps> = ({ places, isLoading }) => {
  if (isLoading) {
    return (
      <Card className="p-4 sm:p-6 mb-4 border-white/10 animate-pulse">
        <div className="h-6 w-44 bg-white/10 rounded mb-4"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="h-24 bg-white/5 rounded-xl"></div>
          <div className="h-24 bg-white/5 rounded-xl"></div>
        </div>
      </Card>
    );
  }

  if (!places) return null;

  const { rivers, mountains, monuments, bridges, cities, featuredCrossing } = places;
  const allHighlights: NearbyPlace[] = [
    ...rivers,
    ...mountains,
    ...monuments,
    ...bridges
  ].slice(0, 6);

  if (allHighlights.length === 0 && !featuredCrossing) return null;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'RIVER':
      case 'LAKE':
        return <Waves className="w-4 h-4 text-cyan-400" />;
      case 'MOUNTAIN':
        return <Mountain className="w-4 h-4 text-amber-400" />;
      case 'MONUMENT':
        return <Landmark className="w-4 h-4 text-emerald-400" />;
      default:
        return <Compass className="w-4 h-4 text-brand-400" />;
    }
  };

  return (
    <Card className="p-4 sm:p-6 mb-4 border-white/10">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <Compass className="w-4 h-4 text-brand-400" />
            <span>Geographic Context & Route Highlights</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Key rivers, mountains, monuments and historical crossings alongside the tracks
          </p>
        </div>
      </div>

      {/* Featured Landmark Crossing (PRD Section 3.12) */}
      {featuredCrossing && (
        <div className="mb-4 p-3.5 rounded-xl bg-gradient-to-r from-brand-600/20 via-blue-600/10 to-transparent border border-brand-500/30 flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center flex-shrink-0 text-brand-300">
            {getCategoryIcon(featuredCrossing.category)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white tracking-wide">
                {featuredCrossing.name}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30 font-semibold uppercase">
                Scenic Feature
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              {featuredCrossing.description}
            </p>
            <div className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-3">
              <span>Near {featuredCrossing.nearStationName}</span>
              <span>•</span>
              <span>{featuredCrossing.distanceFromTrackKm === 0 ? 'Direct Track Viaduct' : `${featuredCrossing.distanceFromTrackKm} km off-track`}</span>
            </div>
          </div>
        </div>
      )}

      {/* Grid of Route Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {allHighlights.map((place) => (
          <div
            key={place.id}
            className="p-3.5 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 hover:bg-white/10 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="p-1 rounded-lg bg-white/5">{getCategoryIcon(place.category)}</span>
                <span className="font-semibold text-xs text-white line-clamp-1">{place.name}</span>
              </div>
              <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                {place.description}
              </p>
            </div>

            <div className="text-[11px] text-slate-500 mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between">
              <span>Near {place.nearStationName}</span>
              <span className="font-mono text-[10px] text-slate-400">{place.distanceFromTrackKm} km</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
