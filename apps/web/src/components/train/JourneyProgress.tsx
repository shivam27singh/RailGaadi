import React from 'react';
import { JourneyProgress as IJourneyProgress } from '@railgaddi/types';
import { formatDistance } from '@railgaddi/utils';
import { Card } from '../ui/Card';

interface JourneyProgressProps {
  progress: IJourneyProgress;
}

export const JourneyProgress: React.FC<JourneyProgressProps> = ({ progress }) => {
  const {
    percentage,
    distanceCoveredKm,
    distanceRemainingKm,
    totalDistanceKm,
    stationsCompleted,
    stationsRemaining
  } = progress;

  return (
    <Card className="p-4 mb-4 border-white/10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Journey Completion
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 font-mono font-bold border border-brand-500/30">
            {percentage}%
          </span>
        </div>

        <div className="text-xs text-slate-400 flex items-center gap-2">
          <span>{stationsCompleted} stations passed</span>
          <span>•</span>
          <span>{stationsRemaining} upcoming</span>
        </div>
      </div>

      {/* Progress Track */}
      <div className="relative w-full h-3 bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/10">
        <div
          className="h-full bg-gradient-to-r from-blue-600 via-brand-500 to-cyan-400 rounded-full transition-all duration-700 ease-out relative shadow-glow-sm"
          style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
        >
          {/* Animated trailing shimmer */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
        </div>
      </div>

      {/* Distance Metrics */}
      <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-white/5 text-center">
        <div>
          <div className="text-[11px] text-slate-500 font-medium">Covered</div>
          <div className="text-xs sm:text-sm font-bold text-slate-200 font-mono">
            {formatDistance(distanceCoveredKm)}
          </div>
        </div>

        <div>
          <div className="text-[11px] text-slate-500 font-medium">Remaining</div>
          <div className="text-xs sm:text-sm font-bold text-brand-400 font-mono">
            {formatDistance(distanceRemainingKm)}
          </div>
        </div>

        <div>
          <div className="text-[11px] text-slate-500 font-medium">Total Distance</div>
          <div className="text-xs sm:text-sm font-bold text-slate-400 font-mono">
            {formatDistance(totalDistanceKm)}
          </div>
        </div>
      </div>
    </Card>
  );
};
