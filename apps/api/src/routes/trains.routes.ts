import { Router, Request, Response } from 'express';
import { trainService } from '../services/train.service.js';
import { journeyService } from '../services/journey.service.js';
import { weatherService } from '../services/weather.service.js';
import { elevationService } from '../services/elevation.service.js';
import { placesService } from '../services/places.service.js';

export const trainsRouter = Router();

/**
 * GET /api/trains/search?q=
 * Searches trains by number or name via RailRadar API.
 */
trainsRouter.get('/search', async (req: Request, res: Response) => {
  const query = (req.query.q as string) || '';
  if (!query.trim()) {
    return res.json({ success: true, data: [] });
  }

  try {
    const results = await trainService.searchTrains(query);
    return res.json({ success: true, data: results });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: {
        code: 'SEARCH_ERROR',
        message: err.message || 'Failed to search trains',
        retryable: true
      }
    });
  }
});

/**
 * GET /api/trains/:id
 * Retrieves train metadata from RailRadar schedule.
 */
trainsRouter.get('/:id', async (req: Request, res: Response) => {
  const trainId = req.params.id;
  try {
    const train = await trainService.getTrainById(trainId);
    if (!train) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'TRAIN_NOT_FOUND',
          message: `Train ${trainId} not found. Please check the train number and try again.`,
          retryable: false
        }
      });
    }
    return res.json({ success: true, data: train });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'TRAIN_FETCH_ERROR', message: err.message || 'Failed to fetch train', retryable: true }
    });
  }
});

/**
 * GET /api/trains/:id/journey
 * Returns the normalized Journey object (train, status, route, progress, timeline).
 */
trainsRouter.get('/:id/journey', async (req: Request, res: Response) => {
  const trainId = req.params.id;
  try {
    const journey = await journeyService.getJourney(trainId);

    if (!journey) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'JOURNEY_NOT_FOUND',
          message: `Live journey data for train ${trainId} is currently unavailable. The train may not be running today.`,
          retryable: true
        }
      });
    }

    return res.json({ success: true, data: journey });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: {
        code: 'JOURNEY_FETCH_ERROR',
        message: err.message || 'Failed to fetch journey',
        retryable: true
      }
    });
  }
});

/**
 * GET /api/trains/:id/live
 * Lightweight live tracking endpoint for periodic auto-refresh.
 */
trainsRouter.get('/:id/live', async (req: Request, res: Response) => {
  const trainId = req.params.id;
  try {
    const liveStatus = await journeyService.getLiveStatus(trainId);

    if (!liveStatus) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'LIVE_STATUS_NOT_FOUND',
          message: `Live status for train ${trainId} not found.`,
          retryable: true
        }
      });
    }

    return res.json({ success: true, data: liveStatus });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: {
        code: 'LIVE_STATUS_ERROR',
        message: err.message || 'Failed to fetch live status',
        retryable: true
      }
    });
  }
});

/**
 * GET /api/trains/:id/weather
 * Returns weather for current, next, destination stations.
 */
trainsRouter.get('/:id/weather', async (req: Request, res: Response) => {
  const trainId = req.params.id;
  try {
    const weather = await weatherService.getWeatherForTrain(trainId);

    if (!weather) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'WEATHER_NOT_FOUND',
          message: 'Weather information temporarily unavailable for this route.',
          retryable: true
        }
      });
    }

    return res.json({ success: true, data: weather });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: {
        code: 'WEATHER_ERROR',
        message: err.message || 'Failed to fetch weather',
        retryable: true
      }
    });
  }
});

/**
 * GET /api/trains/:id/elevation
 * Returns route elevation profile.
 */
trainsRouter.get('/:id/elevation', async (req: Request, res: Response) => {
  const trainId = req.params.id;
  try {
    const elevation = await elevationService.getElevationForTrain(trainId);

    if (!elevation) {
      return res.json({
        success: true,
        data: {
          available: false,
          highestElevationMeters: 0,
          lowestElevationMeters: 0,
          currentElevationMeters: 0,
          highestPointLocation: 'Unavailable',
          points: []
        }
      });
    }

    return res.json({ success: true, data: elevation });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: {
        code: 'ELEVATION_ERROR',
        message: err.message || 'Failed to fetch elevation',
        retryable: true
      }
    });
  }
});

/**
 * GET /api/trains/:id/nearby
 * Returns nearby rivers, bridges, mountains, monuments, and cities via Overpass.
 */
trainsRouter.get('/:id/nearby', async (req: Request, res: Response) => {
  const trainId = req.params.id;
  try {
    const places = await placesService.getNearbyPlacesForTrain(trainId);

    if (!places) {
      return res.json({
        success: true,
        data: { rivers: [], lakes: [], mountains: [], bridges: [], tunnels: [], monuments: [], cities: [] }
      });
    }

    return res.json({ success: true, data: places });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: {
        code: 'PLACES_ERROR',
        message: err.message || 'Failed to fetch nearby places',
        retryable: true
      }
    });
  }
});
