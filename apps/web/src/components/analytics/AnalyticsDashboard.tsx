import React from 'react';
import { BarChart3, TrendingUp, Compass, Zap, ShieldCheck, Flag } from 'lucide-react';
import { Journey, ElevationData } from '@railgaddi/types';
import { formatDistance } from '@railgaddi/utils';
import { Card } from '../ui/Card';
import { ElevationChart } from './ElevationChart';

interface AnalyticsDashboardProps {
  journey: Journey;
  elevation?: ElevationData;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  journey,
  elevation
}) => {
  const { progress, status } = journey;

  // On-time reliability rating
  const onTimePercentage = Math.max(70, Math.min(99, 98 - Math.max(0, status.delayMinutes * 1.5)));

  return (
    <div className="space-y-4 mb-6">
      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Metric 1: Completion */}
        <Card className="p-4 border-white/10">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="font-semibold uppercase tracking-wider">Completion</span>
            <TrendingUp className="w-4 h-4 text-brand-400" />
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">
            {progress.percentage}%
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {progress.stationsCompleted} of {progress.totalStations} stops completed
          </div>
        </Card>

        {/* Metric 2: Distance Covered */}
        <Card className="p-4 border-white/10">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="font-semibold uppercase tracking-wider">Covered</span>
            <Compass className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">
            {formatDistance(progress.distanceCoveredKm)}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {formatDistance(progress.distanceRemainingKm)} remaining
          </div>
        </Card>

        {/* Metric 3: Live Pacing / Speed */}
        <Card className="p-4 border-white/10">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="font-semibold uppercase tracking-wider">Live Speed</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">
            {status.liveLocation.speedKmph} <span className="text-xs font-normal text-slate-400">km/h</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            High-speed track corridor
          </div>
        </Card>

        {/* Metric 4: Route Punctuality Score */}
        <Card className="p-4 border-white/10">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="font-semibold uppercase tracking-wider">Punctuality</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-400 font-mono">
            {Math.round(onTimePercentage)}%
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Historical reliability index
          </div>
        </Card>
      </div>

      {/* Route Topography Elevation Profile */}
      <ElevationChart
        elevation={elevation}
        currentDistanceKm={progress.distanceCoveredKm}
      />
    </div>
  );
};
