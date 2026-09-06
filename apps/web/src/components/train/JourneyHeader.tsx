import React from 'react';
import { Star, Share2, ArrowRight, RefreshCw } from 'lucide-react';
import { Journey } from '@railgaddi/types';
import { getStatusConfig, formatLastUpdated } from '@railgaddi/utils';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface JourneyHeaderProps {
  journey: Journey;
  isRefreshing?: boolean;
  onRefresh?: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  onShare?: () => void;
  shareCopied?: boolean;
}

export const JourneyHeader: React.FC<JourneyHeaderProps> = ({
  journey,
  isRefreshing = false,
  onRefresh,
  isFavorite = false,
  onToggleFavorite,
  onShare,
  shareCopied = false
}) => {
  const { train, status, updatedAt } = journey;
  const statusConfig = getStatusConfig(status.status, status.delayMinutes);
  const freshness = formatLastUpdated(updatedAt);

  return (
    <div className="glass-panel rounded-2xl p-4 sm:p-6 mb-4 border border-white/10 shadow-2xl relative overflow-hidden">
      {/* Background subtle glow */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Train info */}
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="font-mono text-sm sm:text-base font-bold text-brand-400 bg-brand-500/15 border border-brand-500/30 px-2.5 py-0.5 rounded-lg">
              {train.number}
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {train.name}
            </h1>
            <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-400 hidden sm:inline-block">
              {train.type}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-400">
            <span className="font-medium text-slate-300">
              {train.sourceStation.name} ({train.sourceStation.code})
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
            <span className="font-medium text-slate-300">
              {train.destinationStation.name} ({train.destinationStation.code})
            </span>
            <span className="text-slate-600 hidden sm:inline">•</span>
            <span className="hidden sm:inline text-slate-400">
              Dep {train.departureTime} · Arr {train.arrivalTime} ({train.totalDurationFormatted})
            </span>
          </div>
        </div>

        {/* Right: Status badge & Actions */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Status Badge */}
          <div className="flex flex-col items-start md:items-end gap-1">
            <div
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold tracking-wider uppercase ${statusConfig.bgColor} ${statusConfig.textColor} ${statusConfig.borderColor} ${statusConfig.glowColor} shadow-sm`}
            >
              <span className={`w-2 h-2 rounded-full ${statusConfig.dotColor} animate-pulse`} />
              <span>{statusConfig.label}</span>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <span className={`inline-block w-1.5 h-1.5 rounded-full ${freshness.isStale ? 'bg-amber-400' : 'bg-emerald-400'}`} />
              <span>{freshness.label}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 ml-auto md:ml-0">
            {/* Refresh Button */}
            {onRefresh && (
              <Button
                variant="secondary"
                size="sm"
                onClick={onRefresh}
                className="h-9 w-9 p-0"
                title="Refresh live status"
              >
                <RefreshCw className={`w-4 h-4 text-slate-300 ${isRefreshing ? 'animate-spin text-brand-400' : ''}`} />
              </Button>
            )}

            {/* Favorite Button */}
            {onToggleFavorite && (
              <Button
                variant="secondary"
                size="sm"
                onClick={onToggleFavorite}
                className={`h-9 w-9 p-0 ${isFavorite ? 'text-amber-400 border-amber-500/30 bg-amber-500/10' : 'text-slate-400'}`}
                title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                <Star className={`w-4 h-4 ${isFavorite ? 'fill-amber-400 text-amber-400' : ''}`} />
              </Button>
            )}

            {/* Share Button */}
            {onShare && (
              <Button
                variant="primary"
                size="sm"
                onClick={onShare}
                leftIcon={<Share2 className="w-4 h-4" />}
                className="h-9 text-xs"
              >
                {shareCopied ? 'Copied Link!' : 'Share Journey'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
