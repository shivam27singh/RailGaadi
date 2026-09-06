import { Weather } from '@railgaddi/types';

interface CacheEntry {
  data: Weather;
  cachedAt: number;
}

export class OpenWeatherProvider {
  private cache = new Map<string, CacheEntry>();
  private CACHE_TTL_MS = 10 * 60 * 1000;

  private get apiKey(): string {
    return process.env.OPENWEATHER_API_KEY || '';
  }

  constructor() {}

  public async fetchStationWeather(
    stationId: string,
    stationName: string,
    latitude: number,
    longitude: number
  ): Promise<Weather | null> {
    const key = `${latitude.toFixed(3)},${longitude.toFixed(3)}`;
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.cachedAt < this.CACHE_TTL_MS) {
      return cached.data;
    }

    if (!this.apiKey) {
      return null;
    }

    try {
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${this.apiKey}&units=metric`;
      const response = await fetch(url, { signal: AbortSignal.timeout(4000) });

      if (!response.ok) {
        console.warn(`[OPENWEATHER] Request failed for ${stationName}: HTTP ${response.status}`);
        return null;
      }

      const data: any = await response.json();
      const tempC = Math.round(data.main?.temp ?? 25);
      const condition = data.weather?.[0]?.main || 'Clear';
      const description = data.weather?.[0]?.description || 'Clear sky';
      const icon = data.weather?.[0]?.icon || '01d';
      const humidity = Math.round(data.main?.humidity ?? 50);
      const windKmph = Math.round((data.wind?.speed ?? 3) * 3.6);

      // Derive rain probability from clouds / weather condition
      let rainProbability = 0;
      if (condition.toLowerCase().includes('rain')) {
        rainProbability = 80;
      } else if (condition.toLowerCase().includes('drizzle')) {
        rainProbability = 60;
      } else if (condition.toLowerCase().includes('thunder')) {
        rainProbability = 90;
      } else if (data.clouds?.all > 70) {
        rainProbability = 35;
      } else {
        rainProbability = 5;
      }

      const weatherResult: Weather = {
        stationId,
        stationName,
        temperatureC: tempC,
        condition,
        description: description.charAt(0).toUpperCase() + description.slice(1),
        icon,
        humidityPercentage: humidity,
        windSpeedKmph: windKmph,
        rainProbabilityPercentage: rainProbability,
        updatedAt: new Date().toISOString()
      };

      this.cache.set(key, { data: weatherResult, cachedAt: Date.now() });
      return weatherResult;
    } catch (err: any) {
      console.warn(`[OPENWEATHER] Network error for ${stationName}:`, err.message);
      return null;
    }
  }
}

export const openWeatherProvider = new OpenWeatherProvider();
