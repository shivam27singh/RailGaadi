import React from 'react';
import { Clock, Trash2, ArrowRight } from 'lucide-react';
import { TrainSearchResult } from '@railgaddi/types';

interface RecentSearchesProps {
  searches: TrainSearchResult[];
  onSelect: (train: TrainSearchResult) => void;
  onClear: () => void;
}

export const RecentSearches: React.FC<RecentSearchesProps> = ({
  searches,
  onSelect,
  onClear
}) => {
  if (searches.length === 0) return null;

  return (
    <div className="w-full max-w-2xl mx-auto mt-6">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
          <Clock className="w-3.5 h-3.5" />
          <span>Recently Tracked</span>
        </div>
        <button
          onClick={onClear}
          className="text-xs text-slate-500 hover:text-slate-300 transition flex items-center gap-1 hover:underline"
        >
          <Trash2 className="w-3 h-3" />
          <span>Clear</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {searches.map((train) => (
          <div
            key={train.id}
            onClick={() => onSelect(train)}
            className="group flex items-center justify-between p-3 rounded-xl glass-panel-subtle hover:bg-white/10 border border-white/5 hover:border-white/15 cursor-pointer transition-all"
          >
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-xs font-bold text-brand-400 bg-brand-500/10 px-2 py-1 rounded-md border border-brand-500/20">
                {train.number}
              </span>
              <div>
                <div className="text-xs font-medium text-slate-200 group-hover:text-white line-clamp-1">
                  {train.name}
                </div>
                <div className="text-[11px] text-slate-500">
                  {train.sourceStation.code} → {train.destinationStation.code}
                </div>
              </div>
            </div>

            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-slate-200 group-hover:translate-x-0.5 transition-all" />
          </div>
        ))}
      </div>
    </div>
  );
};
