import React from 'react';
import { Star, ArrowRight } from 'lucide-react';
import { TrainSearchResult } from '@railgaddi/types';

interface FavoriteTrainListProps {
  favorites: TrainSearchResult[];
  onSelect: (train: TrainSearchResult) => void;
}

export const FavoriteTrainList: React.FC<FavoriteTrainListProps> = ({
  favorites,
  onSelect
}) => {
  if (favorites.length === 0) return null;

  return (
    <div className="w-full max-w-2xl mx-auto mt-6">
      <div className="flex items-center gap-2 mb-3 px-1 text-xs font-semibold uppercase tracking-wider text-amber-400">
        <Star className="w-3.5 h-3.5 fill-amber-400" />
        <span>Starred Trains</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {favorites.map((train) => (
          <div
            key={train.id}
            onClick={() => onSelect(train)}
            className="group flex items-center justify-between p-3 rounded-xl glass-panel-subtle hover:bg-white/10 border border-amber-500/20 hover:border-amber-500/40 cursor-pointer transition-all"
          >
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-1 rounded-md border border-amber-500/20">
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
