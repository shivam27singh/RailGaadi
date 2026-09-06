import React from 'react';
import { CheckCircle2, Clock, MapPin, ArrowRight } from 'lucide-react';
import { StationTimelineItem, Station } from '@railgaddi/types';
import { formatDelay } from '@railgaddi/utils';
import { Card } from '../ui/Card';

interface StationTimelineProps {
  timeline: StationTimelineItem[];
  currentStationId?: string;
  onSelectStation?: (station: Station) => void;
}

export const StationTimeline: React.FC<StationTimelineProps> = ({
  timeline,
  currentStationId,
  onSelectStation
}) => {
  const [filterHaltsOnly, setFilterHaltsOnly] = React.useState(true);

  const hasNonHalts = timeline.some((t) => t.isHalt === false);
  const displayedTimeline = hasNonHalts && filterHaltsOnly
    ? timeline.filter((t) => t.isHalt !== false || t.status === 'CURRENT' || t.station.id === currentStationId)
    : timeline;

  return (
    <Card className="p-4 sm:p-6 mb-4 border-white/10">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-white/10">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <Clock className="w-4 h-4 text-brand-400" />
            <span>Route Timeline & Halts</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Showing {displayedTimeline.length} of {timeline.length} stations
          </p>
        </div>

        {hasNonHalts && (
          <div className="flex items-center gap-1 bg-white/5 p-1 rounded-lg border border-white/10 text-[11px]">
            <button
              onClick={() => setFilterHaltsOnly(true)}
              className={`px-2.5 py-1 rounded-md font-medium transition ${
                filterHaltsOnly ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Halts ({timeline.filter((t) => t.isHalt !== false).length})
            </button>
            <button
              onClick={() => setFilterHaltsOnly(false)}
              className={`px-2.5 py-1 rounded-md font-medium transition ${
                !filterHaltsOnly ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              All Passing ({timeline.length})
            </button>
          </div>
        )}
      </div>

      {/* Timeline Halts List */}
      <div className="relative pl-2 sm:pl-4 space-y-6">
        {/* Continuous track line running behind the halts */}
        <div className="absolute left-[15px] sm:left-[23px] top-4 bottom-4 w-0.5 bg-gradient-to-b from-blue-500 via-brand-500/50 to-slate-800" />

        {displayedTimeline.map((item) => {
          const { station, scheduledArrival, scheduledDeparture, actualArrival, actualDeparture, delayMinutes, platform, distanceFromOriginKm, status } = item;
          const isCurrent = status === 'CURRENT' || station.id === currentStationId;
          const isCompleted = status === 'COMPLETED';
          const delay = formatDelay(delayMinutes);

          return (
            <div
              key={station.id}
              onClick={() => onSelectStation && onSelectStation(station)}
              className={`relative flex items-start gap-4 p-2.5 sm:p-3.5 rounded-xl transition-all cursor-pointer ${
                isCurrent
                  ? 'bg-brand-500/15 border border-brand-500/30 shadow-glow-sm'
                  : 'hover:bg-white/5 border border-transparent'
              }`}
            >
              {/* Station State Node */}
              <div className="relative z-10 flex-shrink-0 mt-0.5">
                {isCurrent ? (
                  <div className="relative flex items-center justify-center">
                    <span className="animate-ping absolute inline-flex h-6 w-6 rounded-full bg-brand-400 opacity-75" />
                    <div className="w-5 h-5 rounded-full bg-brand-500 border-2 border-white flex items-center justify-center shadow-glow-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-white" />
                    </div>
                  </div>
                ) : isCompleted ? (
                  <div className="w-5 h-5 rounded-full bg-blue-600 border-2 border-slate-900 flex items-center justify-center text-white">
                    <CheckCircle2 className="w-3.5 h-3.5 fill-current text-slate-950" />
                  </div>
                ) : (
                  <div className="w-5 h-5 rounded-full bg-slate-800 border-2 border-slate-600 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                  </div>
                )}
              </div>

              {/* Station Info */}
              <div className="flex-grow min-w-0">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white hover:text-brand-300 transition-colors">
                      {station.name}
                    </span>
                    <span className="font-mono text-xs text-brand-400 bg-brand-500/10 px-1.5 py-0.5 rounded border border-brand-500/20">
                      {station.code}
                    </span>
                    {isCurrent && (
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-brand-500 text-white shadow-sm">
                        Current Stop
                      </span>
                    )}
                  </div>

                  {/* Delay Status Pill */}
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                      delay.isDelayed
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    }`}
                  >
                    {delay.text}
                  </span>
                </div>

                {/* Timings and Platform */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-500">Arr:</span>
                    <span className="font-mono text-slate-200">
                      {scheduledArrival === 'Source' ? 'Origin' : scheduledArrival}
                    </span>
                    {actualArrival && actualArrival !== scheduledArrival && (
                      <span className="font-mono text-amber-400 text-[11px]">
                        ({actualArrival})
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-500">Dep:</span>
                    <span className="font-mono text-slate-200">
                      {scheduledDeparture === 'Destination' ? 'Terminus' : scheduledDeparture}
                    </span>
                    {actualDeparture && actualDeparture !== scheduledDeparture && (
                      <span className="font-mono text-amber-400 text-[11px]">
                        ({actualDeparture})
                      </span>
                    )}
                  </div>

                  <div className="text-slate-500">
                    Platform {platform || '1'}
                  </div>

                  <div className="text-slate-500">
                    {distanceFromOriginKm} km
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
