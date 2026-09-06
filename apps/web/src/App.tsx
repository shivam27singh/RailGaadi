import React, { useState, useEffect } from 'react';
import {
  Clock,
  BarChart3,
  CloudSun,
  AlertTriangle,
  Train as TrainIcon,
  Search,
  Sparkles
} from 'lucide-react';
import { TrainSearchResult, Station } from '@railgaddi/types';
import { useLiveJourney } from './hooks/useLiveJourney';
import { useRecentSearches } from './hooks/useRecentSearches';
import { useFavorites } from './hooks/useFavorites';
import { useWeather } from './hooks/useWeather';
import { useElevation } from './hooks/useElevation';
import { useNearbyPlaces } from './hooks/useNearbyPlaces';
import { useShareJourney } from './hooks/useShareJourney';

import { Navbar } from './components/layout/Navbar';
import { TrainSearch } from './components/search/TrainSearch';
import { RecentSearches } from './components/search/RecentSearches';
import { FavoriteTrainList } from './components/search/FavoriteTrainList';
import { FavoritesModal } from './components/search/FavoritesModal';

import { JourneyHeader } from './components/train/JourneyHeader';
import { TrainStatusCard } from './components/train/TrainStatusCard';
import { JourneyProgress } from './components/train/JourneyProgress';

import { JourneyMap } from './components/map/JourneyMap';
import { StationTimeline } from './components/timeline/StationTimeline';
import { AnalyticsDashboard } from './components/analytics/AnalyticsDashboard';
import { WeatherCard } from './components/weather/WeatherCard';
import { NearbyPlaces } from './components/weather/NearbyPlaces';

export const App: React.FC = () => {
  // Read trainId from URL search param — no default hardcoded train
  const [activeTrainId, setActiveTrainId] = useState<string | null>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('trainId') || null;
  });

  const [activeTab, setActiveTab] = useState<'timeline' | 'analytics' | 'companion'>('timeline');
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [_selectedStation, setSelectedStation] = useState<Station | null>(null);

  // Core Live Journey Hook — only runs when a train is selected
  const {
    journey,
    isLoading: isJourneyLoading,
    isRefreshing,
    error: journeyError,
    refetch: refetchJourney
  } = useLiveJourney(activeTrainId ?? '');

  // Intelligence hooks — only fire when a trainId is active
  const { data: weather, isLoading: isWeatherLoading } = useWeather(activeTrainId ?? '');
  const { data: elevation } = useElevation(activeTrainId ?? '');
  const { data: places, isLoading: isPlacesLoading } = useNearbyPlaces(activeTrainId ?? '');

  // Searches, favorites and sharing
  const { recentSearches, addRecentSearch, clearAllRecent } = useRecentSearches();
  const { favorites, isFavorite, toggleFavorite } = useFavorites();
  const { share, copied: shareCopied } = useShareJourney();

  // Sync URL when trainId changes
  useEffect(() => {
    const url = new URL(window.location.href);
    if (activeTrainId) {
      url.searchParams.set('trainId', activeTrainId);
    } else {
      url.searchParams.delete('trainId');
    }
    window.history.replaceState({}, '', url.toString());
  }, [activeTrainId]);

  const handleSelectTrain = (train: TrainSearchResult) => {
    setActiveTrainId(train.id);
    addRecentSearch(train);
  };

  const handleShareClick = () => {
    if (journey) {
      share(journey.train.id, journey.train.name);
    }
  };

  const showLanding = !activeTrainId && !isJourneyLoading;

  return (
    <div className="min-h-screen bg-background text-slate-100 flex flex-col selection:bg-brand-500/30">
      {/* Top Navigation Bar */}
      <Navbar
        onHomeClick={() => {
          setActiveTrainId(null);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onFavoritesClick={() => setIsFavoritesOpen(true)}
        favoritesCount={favorites.length}
        currentTrainId={activeTrainId ?? undefined}
      />

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* ── LANDING PAGE: shown when no train selected ── */}
        {showLanding && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8 text-center">
            {/* Hero */}
            <div className="space-y-3 max-w-2xl">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-brand-600/20 border border-brand-500/30 flex items-center justify-center">
                  <TrainIcon className="w-8 h-8 text-brand-400" />
                </div>
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white">
                Track any Indian train,{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-blue-400">
                  live
                </span>
              </h1>
              <p className="text-lg text-slate-400 max-w-xl mx-auto">
                Real-time position, delay tracking, weather, and elevation — for every train on the Indian Railways network.
              </p>
            </div>

            {/* Search */}
            <div className="w-full max-w-2xl">
              <TrainSearch
                onSelectTrain={handleSelectTrain}
                placeholder="Enter train number or name (e.g. 12951, Rajdhani, Vande Bharat)..."
                autoFocus
              />
            </div>

            {/* Feature pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 text-sm text-slate-400">
              {['Live GPS Tracking', 'Delay Analytics', 'Weather Alerts', 'Route Elevation', 'Nearby Landmarks'].map(feat => (
                <span key={feat} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                  <Sparkles className="w-3 h-3 text-brand-400" />
                  {feat}
                </span>
              ))}
            </div>

            {/* Popular trains quick-access */}
            <div className="w-full max-w-2xl">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">
                Popular Trains
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { number: '12951', name: 'Mumbai Rajdhani' },
                  { number: '12301', name: 'Howrah Rajdhani' },
                  { number: '22436', name: 'Vande Bharat' },
                  { number: '12002', name: 'New Delhi Shatabdi' }
                ].map(t => (
                  <button
                    key={t.number}
                    onClick={() => setActiveTrainId(t.number)}
                    className="flex flex-col items-start p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-brand-500/30 transition-all text-left group"
                  >
                    <span className="font-mono text-brand-400 font-bold text-sm group-hover:text-brand-300">{t.number}</span>
                    <span className="text-xs text-slate-400 mt-0.5 line-clamp-1">{t.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Recent & Favorites shown on landing too */}
            {(recentSearches.length > 0 || favorites.length > 0) && (
              <div className="w-full max-w-2xl border-t border-white/10 pt-6 space-y-4">
                <RecentSearches
                  searches={recentSearches}
                  onSelect={handleSelectTrain}
                  onClear={clearAllRecent}
                />
                <FavoriteTrainList
                  favorites={favorites}
                  onSelect={handleSelectTrain}
                />
              </div>
            )}
          </div>
        )}

        {/* ── SEARCH BAR (shown when viewing a train) ── */}
        {activeTrainId && (
          <section className="text-center pt-2 pb-2">
            <TrainSearch
              onSelectTrain={handleSelectTrain}
              placeholder="Search another train..."
            />
          </section>
        )}

        {/* ── LOADING STATE ── */}
        {activeTrainId && isJourneyLoading && (
          <div className="space-y-4 animate-pulse">
            <div className="h-8 w-48 bg-white/5 rounded-lg" />
            <div className="h-28 bg-white/5 rounded-2xl glass-panel" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 h-[520px] bg-white/5 rounded-2xl glass-panel" />
              <div className="h-[520px] bg-white/5 rounded-2xl glass-panel" />
            </div>
          </div>
        )}

        {/* ── ERROR STATE ── */}
        {activeTrainId && journeyError && !isJourneyLoading && (
          <div className="p-8 rounded-2xl glass-panel border border-rose-500/30 text-center max-w-xl mx-auto my-8">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">Train Data Unavailable</h3>
            <p className="text-sm text-slate-400 mb-1">
              Train <span className="font-mono text-slate-300">{activeTrainId}</span> could not be loaded.
            </p>
            <p className="text-xs text-slate-500 mb-4">
              {journeyError.message || 'The train may not be running today, or is not tracked by RailRadar.'}
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => refetchJourney()}
                className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-sm transition"
              >
                Retry
              </button>
              <button
                onClick={() => setActiveTrainId(null)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-semibold transition"
              >
                <Search className="w-3.5 h-3.5 inline mr-1" />
                Search Another Train
              </button>
            </div>
          </div>
        )}

        {/* ── LIVE JOURNEY SURFACE ── */}
        {journey && !isJourneyLoading && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Top Live Journey Header */}
            <JourneyHeader
              journey={journey}
              isRefreshing={isRefreshing}
              onRefresh={refetchJourney}
              isFavorite={isFavorite(journey.train.id)}
              onToggleFavorite={() =>
                toggleFavorite({
                  id: journey.train.id,
                  number: journey.train.number,
                  name: journey.train.name,
                  type: journey.train.type,
                  sourceStation: journey.train.sourceStation,
                  destinationStation: journey.train.destinationStation,
                  departureTime: journey.train.departureTime,
                  arrivalTime: journey.train.arrivalTime
                })
              }
              onShare={handleShareClick}
              shareCopied={shareCopied}
            />

            {/* Live Stats Cards */}
            <TrainStatusCard journey={journey} />

            {/* Central Split View */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
              {/* Map */}
              <div className="lg:col-span-8 space-y-4">
                <JourneyMap
                  journey={journey}
                  heightClass="h-[480px] sm:h-[560px] lg:h-[620px]"
                  onSelectStation={(st) => setSelectedStation(st)}
                />
                <JourneyProgress progress={journey.progress} />
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-4 space-y-4">
                {/* Tab navigation */}
                <div className="flex rounded-xl p-1 bg-surface border border-white/10 text-xs font-semibold">
                  <button
                    onClick={() => setActiveTab('timeline')}
                    className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition ${
                      activeTab === 'timeline'
                        ? 'bg-brand-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Halts</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('analytics')}
                    className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition ${
                      activeTab === 'analytics'
                        ? 'bg-brand-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <BarChart3 className="w-3.5 h-3.5" />
                    <span>Analytics</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('companion')}
                    className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition ${
                      activeTab === 'companion'
                        ? 'bg-brand-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <CloudSun className="w-3.5 h-3.5" />
                    <span>Travel</span>
                  </button>
                </div>

                {activeTab === 'timeline' && (
                  <div className="max-h-[660px] overflow-y-auto pr-1">
                    <StationTimeline
                      timeline={journey.timeline}
                      currentStationId={journey.status.currentStationId}
                      onSelectStation={(st) => setSelectedStation(st)}
                    />
                  </div>
                )}
                {activeTab === 'analytics' && (
                  <div className="max-h-[660px] overflow-y-auto pr-1">
                    <AnalyticsDashboard journey={journey} elevation={elevation} />
                  </div>
                )}
                {activeTab === 'companion' && (
                  <div className="max-h-[660px] overflow-y-auto pr-1 space-y-4">
                    <WeatherCard weather={weather} isLoading={isWeatherLoading} />
                    <NearbyPlaces places={places} isLoading={isPlacesLoading} />
                  </div>
                )}
              </div>
            </div>

            {/* Bottom expanded sections */}
            <div className="pt-4 border-t border-white/10 space-y-6">
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <BarChart3 className="w-4 h-4 text-brand-400" />
                  <h3 className="text-base font-bold text-white">Journey Analytics & Altitude</h3>
                </div>
                <AnalyticsDashboard journey={journey} elevation={elevation} />
              </section>
              <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <WeatherCard weather={weather} isLoading={isWeatherLoading} />
                <NearbyPlaces places={places} isLoading={isPlacesLoading} />
              </section>
            </div>

            {/* Recent / Favorites */}
            <section className="pt-6 border-t border-white/5">
              <RecentSearches
                searches={recentSearches}
                onSelect={handleSelectTrain}
                onClear={clearAllRecent}
              />
              <FavoriteTrainList
                favorites={favorites}
                onSelect={handleSelectTrain}
              />
            </section>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto py-6 border-t border-white/10 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">RailGaddi</span>
            <span>•</span>
            <span>Live Train Journey Platform for India</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>RailRadar</span>
            <span>•</span>
            <span>MapLibre GL</span>
            <span>•</span>
            <span>OpenWeather</span>
            <span>•</span>
            <span>OpenStreetMap</span>
          </div>
        </div>
      </footer>

      {/* Favorites Modal */}
      <FavoritesModal
        isOpen={isFavoritesOpen}
        onClose={() => setIsFavoritesOpen(false)}
        favorites={favorites}
        onSelectTrain={handleSelectTrain}
        onToggleFavorite={toggleFavorite}
      />
    </div>
  );
};
