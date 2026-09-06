import React from 'react';
import { Train, Star, Search, Compass, Share2 } from 'lucide-react';
import { Button } from '../ui/Button';

interface NavbarProps {
  onHomeClick?: () => void;
  onFavoritesClick?: () => void;
  favoritesCount?: number;
  currentTrainId?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  onHomeClick,
  onFavoritesClick,
  favoritesCount = 0,
  currentTrainId
}) => {
  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-white/10 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo & Brand */}
        <div
          onClick={onHomeClick}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-glow-sm border border-brand-400/40 group-hover:scale-105 transition-transform">
            <Train className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base sm:text-lg tracking-tight text-white group-hover:text-brand-300 transition-colors">
                RailGaddi
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-brand-500/20 text-brand-300 border border-brand-500/30 uppercase tracking-widest">
                LIVE
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
              India’s Live Train Journey Platform
            </p>
          </div>
        </div>

        {/* Right navigation / actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Starred Trains Button */}
          <button
            onClick={onFavoritesClick}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface/80 hover:bg-surface text-slate-300 hover:text-white border border-white/10 transition text-xs font-medium"
            title="Saved trains"
          >
            <Star className={`w-3.5 h-3.5 ${favoritesCount > 0 ? 'fill-amber-400 text-amber-400' : ''}`} />
            <span className="hidden sm:inline">Favorites</span>
            {favoritesCount > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                {favoritesCount}
              </span>
            )}
          </button>

          {/* Quick Find Button if currently tracking a train */}
          {currentTrainId && onHomeClick && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onHomeClick}
              leftIcon={<Search className="w-3.5 h-3.5" />}
              className="text-xs h-9"
            >
              <span className="hidden sm:inline">Change Train</span>
              <span className="sm:hidden">Search</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};
