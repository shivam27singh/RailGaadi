import React from 'react';
import { CloudRain, Wind, Droplets, Sun, Moon, Cloud, CloudSun, AlertCircle } from 'lucide-react';
import { TrainWeatherResponse, Weather } from '@railgaddi/types';
import { Card } from '../ui/Card';

interface WeatherCardProps {
  weather: TrainWeatherResponse | undefined;
  isLoading?: boolean;
}

export const WeatherCard: React.FC<WeatherCardProps> = ({ weather, isLoading }) => {
  if (isLoading) {
    return (
      <Card className="p-4 sm:p-6 mb-4 border-white/10 animate-pulse">
        <div className="h-6 w-36 bg-white/10 rounded mb-4"></div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="h-28 bg-white/5 rounded-xl"></div>
          <div className="h-28 bg-white/5 rounded-xl"></div>
          <div className="h-28 bg-white/5 rounded-xl"></div>
        </div>
      </Card>
    );
  }

  if (!weather) {
    return (
      <Card className="p-4 sm:p-6 mb-4 border-white/10 text-center">
        <p className="text-xs text-slate-500">Weather data temporarily unavailable</p>
      </Card>
    );
  }

  const { current, next, destination, summaryMessage, routeForecast } = weather;

  const renderWeatherNode = (w: Weather | undefined, label: string) => {
    if (!w) return null;

    return (
      <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              {label}
            </span>
            <span className="text-[11px] text-slate-400 font-medium">
              {w.stationName}
            </span>
          </div>

          <div className="flex items-center justify-between mt-2">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-white font-mono">{w.temperatureC}°</span>
              <span className="text-xs text-slate-400">C</span>
            </div>

            <div className="text-right">
              <div className="text-xs font-semibold text-slate-200">{w.condition}</div>
              <div className="text-[11px] text-slate-400 line-clamp-1">{w.description}</div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400 mt-3 pt-2 border-t border-white/5">
          <div className="flex items-center gap-1">
            <Droplets className="w-3 h-3 text-cyan-400" />
            <span>{w.humidityPercentage}% Hum</span>
          </div>
          <div className="flex items-center gap-1">
            <Wind className="w-3 h-3 text-slate-400" />
            <span>{w.windSpeedKmph} km/h</span>
          </div>
          <div className="flex items-center gap-1">
            <CloudRain className="w-3 h-3 text-blue-400" />
            <span>{w.rainProbabilityPercentage}% Rain</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className="p-4 sm:p-6 mb-4 border-white/10">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <CloudSun className="w-4 h-4 text-amber-400" />
            <span>Journey Weather & Route Rain Radar</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Atmospheric conditions across your railway stations
          </p>
        </div>
      </div>

      {/* Simplified Route Rain Insight Banner (PRD Section 3.11) */}
      {summaryMessage && (
        <div className="mb-4 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-medium flex items-center gap-2.5">
          <CloudRain className="w-4 h-4 text-blue-400 flex-shrink-0" />
          <span>{summaryMessage}</span>
        </div>
      )}

      {/* Station Weather Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {renderWeatherNode(current, 'Current Stop')}
        {renderWeatherNode(next, 'Next Stop')}
        {renderWeatherNode(destination, 'Destination')}
      </div>
    </Card>
  );
};
