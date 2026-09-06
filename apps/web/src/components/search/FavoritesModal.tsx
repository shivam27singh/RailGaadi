import React from 'react';
import { X, Star, ArrowRight, Trash2 } from 'lucide-react';
import { TrainSearchResult } from '@railgaddi/types';

interface FavoritesModalProps {
  isOpen: boolean;
  onClose: () => void;
  favorites: TrainSearchResult[];
  onSelectTrain: (train: TrainSearchResult) => void;
  onToggleFavorite: (train: TrainSearchResult) => void;
}

export const FavoritesModal: React.FC<FavoritesModalProps> = ({
  isOpen,
  onClose,
  favorites,
  onSelectTrain,
  onToggleFavorite
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg glass-dropdown rounded-2xl p-5 border border-white/10 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <h3 className="text-base font-bold text-white">Your Starred Trains</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="mt-4 max-h-[360px] overflow-y-auto space-y-2">
          {favorites.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              <Star className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p>No favorite trains saved yet.</p>
              <p className="text-slate-500 mt-1">
                Click the star icon on any live train journey to pin it here.
              </p>
            </div>
          ) : (
            favorites.map((train) => (
              <div
                key={train.id}
                onClick={() => {
                  onSelectTrain(train);
                  onClose();
                }}
                className="group flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-amber-500/30 cursor-pointer transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20">
                    {train.number}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                      {train.name}
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <span>{train.sourceStation.code}</span>
                      <ArrowRight className="w-3 h-3 text-slate-500" />
                      <span>{train.destinationStation.code}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(train);
                    }}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                    title="Remove favorite"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
