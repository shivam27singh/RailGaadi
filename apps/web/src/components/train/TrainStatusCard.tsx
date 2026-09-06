import React from 'react';
import { Gauge, Clock, Navigation, MapPin, Compass } from 'lucide-react';
import { Journey } from '@railgaddi/types';
import { formatETA, formatDelay } from '@railgaddi/utils';
import { Card } from '../ui/Card';

interface TrainStatusCardProps {
  journey: Journey;
}

export const TrainStatusCard: React.FC<TrainStatusCardProps> = ({ journey }) => {
  const { status, currentStation, nextStation } = journey;
  const delayInfo = formatDelay(status.delayMinutes);
  const etaText = formatETA(status.etaToNextMinutes);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
      {/* Current Station */}
      <Card className="p-4 flex items-center gap-3.5 border-white/10">
        <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0">
          <MapPin className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Current Station
          </div>
          <div className="text-sm font-bold text-white truncate mt-0.5">
            {currentStation ? currentStation.name : 'In Transit'}
          </div>
          <div className="text-xs text-emerald-400 font-medium">
            {currentStation ? currentStation.code : '--'}
          </div>
        </div>
      </Card>

      {/* Next Station & ETA */}
      <Card className="p-4 flex items-center gap-3.5 border-white/10">
        <div className="w-11 h-11 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 flex-shrink-0">
          <Navigation className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Next Stop
          </div>
          <div className="text-sm font-bold text-white truncate mt-0.5">
            {nextStation ? nextStation.name : 'Terminating'}
          </div>
          <div className="text-xs text-brand-400 font-medium flex items-center gap-1">
            <span>ETA {etaText}</span>
          </div>
        </div>
      </Card>

      {/* Running Delay */}
      <Card className="p-4 flex items-center gap-3.5 border-white/10">
        <div
          className={`w-11 h-11 rounded-xl border flex items-center justify-center flex-shrink-0 ${
            delayInfo.isDelayed
              ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
              : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
          }`}
        >
          <Clock className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Delay Status
          </div>
          <div
            className={`text-sm font-bold truncate mt-0.5 ${
              delayInfo.isDelayed ? 'text-amber-400' : 'text-emerald-400'
            }`}
          >
            {delayInfo.text}
          </div>
          <div className="text-xs text-slate-400">
            {delayInfo.isOnTime ? 'Running as scheduled' : 'From scheduled time'}
          </div>
        </div>
      </Card>

      {/* Speed & Bearing */}
      <Card className="p-4 flex items-center gap-3.5 border-white/10">
        <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 flex-shrink-0">
          <Gauge className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Live Speed
          </div>
          <div className="text-sm font-bold text-white truncate mt-0.5 font-mono">
            {status.liveLocation.speedKmph} km/h
          </div>
          <div className="text-xs text-slate-400 flex items-center gap-1">
            <Compass className="w-3 h-3 text-slate-500" />
            <span>Heading {status.liveLocation.bearing}°</span>
          </div>
        </div>
      </Card>
    </div>
  );
};
