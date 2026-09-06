import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Train as TrainIcon, Clock, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { useTrainSearch } from '../../hooks/useTrainSearch';
import { useRecentSearches } from '../../hooks/useRecentSearches';
import { TrainSearchResult } from '@railgaddi/types';

interface TrainSearchProps {
  onSelectTrain: (train: TrainSearchResult) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export const TrainSearch: React.FC<TrainSearchProps> = ({
  onSelectTrain,
  placeholder = 'Search by train number or name (e.g. 12951, Rajdhani, Vande Bharat)...',
  autoFocus = false
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { results, isLoading, debouncedQuery } = useTrainSearch(query);
  const { recentSearches, addRecentSearch, removeRecentSearch } = useRecentSearches();

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (train: TrainSearchResult) => {
    addRecentSearch(train);
    setQuery(`${train.number} - ${train.name}`);
    setIsOpen(false);
    onSelectTrain(train);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const currentList = results.length > 0 ? results : !query ? recentSearches : [];

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setIsOpen(true);
      setSelectedIndex((prev) => (prev < currentList.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setIsOpen(true);
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : currentList.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && currentList[selectedIndex]) {
        handleSelect(currentList[selectedIndex]);
      } else if (results.length > 0) {
        handleSelect(results[0]);
      } else if (/^\d{4,6}$/.test(query.trim())) {
        const num = query.trim();
        handleSelect({
          id: num,
          number: num,
          name: `Train ${num}`,
          type: 'Indian Railways',
          sourceStation: { id: num, code: '...', name: 'Origin', latitude: 0, longitude: 0 },
          destinationStation: { id: num, code: '...', name: 'Destination', latitude: 0, longitude: 0 },
          departureTime: '--:--',
          arrivalTime: '--:--'
        });
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-2xl mx-auto z-40">
      {/* Search Input Bar */}
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-brand-500/30 to-blue-500/30 rounded-2xl blur-sm opacity-50 group-focus-within:opacity-100 transition duration-300"></div>
        <div className="relative flex items-center bg-surface/90 backdrop-blur-xl border border-white/10 group-focus-within:border-brand-500/50 rounded-2xl px-4 py-3 shadow-2xl transition-all">
          <Search className="w-5 h-5 text-slate-400 group-focus-within:text-brand-400 mr-3 transition-colors flex-shrink-0" />
          
          <input
            ref={inputRef}
            type="text"
            value={query}
            autoFocus={autoFocus}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
              setSelectedIndex(-1);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full bg-transparent text-slate-100 placeholder-slate-400 text-base focus:outline-none"
          />

          {isLoading && (
            <Loader2 className="w-5 h-5 text-brand-400 animate-spin flex-shrink-0 ml-2" />
          )}

          {query && !isLoading && (
            <button
              onClick={() => {
                setQuery('');
                setIsOpen(false);
                inputRef.current?.focus();
              }}
              className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition flex-shrink-0 ml-2"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <div className="hidden sm:flex items-center gap-1 ml-3 pl-3 border-l border-white/10 text-xs text-slate-500 font-mono">
            <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[10px]">ESC</kbd>
          </div>
        </div>
      </div>

      {/* Autocomplete / Suggestions Dropdown */}
      {isOpen && (
        <div className="absolute left-0 right-0 mt-2 glass-dropdown rounded-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150 max-h-[420px] overflow-y-auto">
          {/* Quick Track Numeric Train Action */}
          {/^\d{4,6}$/.test(query.trim()) && !results.some(r => r.number === query.trim()) && (
            <div className="p-2 border-b border-white/5">
              <div
                onClick={() =>
                  handleSelect({
                    id: query.trim(),
                    number: query.trim(),
                    name: `Train ${query.trim()}`,
                    type: 'Indian Railways',
                    sourceStation: { id: query.trim(), code: '...', name: 'Origin', latitude: 0, longitude: 0 },
                    destinationStation: { id: query.trim(), code: '...', name: 'Destination', latitude: 0, longitude: 0 },
                    departureTime: '--:--',
                    arrivalTime: '--:--'
                  })
                }
                className="p-3 rounded-xl bg-brand-600/20 hover:bg-brand-600/30 border border-brand-500/40 text-white cursor-pointer flex items-center justify-between transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-500/20 border border-brand-500/40 flex items-center justify-center text-brand-300 font-mono font-bold text-sm group-hover:scale-105 transition-transform">
                    {query.trim()}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-white flex items-center gap-2">
                      <span>Track Train #{query.trim()}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-300 font-medium">Direct Track</span>
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">Press Enter or click to fetch live telemetry & GPS route</div>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-brand-400 font-semibold group-hover:translate-x-1 transition-transform">
                  <span>Track</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          )}

          {/* Active Search Results */}
          {results.length > 0 && (
            <div className="p-2">
              <div className="px-3 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-brand-400" />
                Matching Trains
              </div>
              <div className="space-y-1 mt-1">
                {results.map((train, idx) => {
                  const isSelected = selectedIndex === idx;
                  return (
                    <div
                      key={train.id}
                      onClick={() => handleSelect(train)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-brand-600/20 text-white border border-brand-500/30'
                          : 'hover:bg-white/5 text-slate-200 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 font-mono font-bold text-sm">
                          {train.number}
                        </div>
                        <div>
                          <div className="font-semibold text-sm flex items-center gap-2">
                            <span>{train.name}</span>
                            <span className="text-xs px-2 py-0.5 rounded bg-white/5 text-slate-400 border border-white/5">
                              {train.type}
                            </span>
                          </div>
                          <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                            <span>{train.sourceStation.name} ({train.sourceStation.code})</span>
                            <ArrowRight className="w-3 h-3 text-slate-500" />
                            <span>{train.destinationStation.name} ({train.destinationStation.code})</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right hidden sm:block">
                        <div className="text-xs font-medium text-slate-300">
                          {train.departureTime} → {train.arrivalTime}
                        </div>
                        <div className="text-[11px] text-brand-400/90 flex items-center justify-end gap-1 mt-0.5">
                          <span>Live Journey</span>
                          <ArrowRight className="w-3 h-3" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Empty Search Result State */}
          {debouncedQuery.length > 0 && results.length === 0 && !isLoading && (
            <div className="p-8 text-center">
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3 text-slate-400">
                <TrainIcon className="w-6 h-6" />
              </div>
              <p className="text-slate-200 font-medium text-sm">No trains found for "{debouncedQuery}"</p>
              <p className="text-slate-500 text-xs mt-1">Enter a valid Indian train number (e.g. 12951) or train name</p>
            </div>
          )}

          {/* Recent Searches Fallback when query is empty */}
          {!query && recentSearches.length > 0 && (
            <div className="p-2">
              <div className="px-3 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Recent Searches
              </div>
              <div className="space-y-1 mt-1">
                {recentSearches.map((train, idx) => {
                  const isSelected = selectedIndex === idx;
                  return (
                    <div
                      key={train.id}
                      onClick={() => handleSelect(train)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-white/10 text-white'
                          : 'hover:bg-white/5 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-300 font-mono text-xs">
                          {train.number}
                        </div>
                        <div>
                          <div className="text-xs font-medium">{train.name}</div>
                          <div className="text-[11px] text-slate-500">
                            {train.sourceStation.code} → {train.destinationStation.code}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeRecentSearch(train.id);
                        }}
                        className="p-1 text-slate-500 hover:text-slate-300 rounded hover:bg-white/10 transition"
                        title="Remove from recents"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
