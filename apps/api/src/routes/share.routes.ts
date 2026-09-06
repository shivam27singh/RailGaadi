import { Router, Request, Response } from 'express';
import { sharingService } from '../services/sharing.service.js';

export const shareRouter = Router();

/**
 * POST /api/journeys/share
 * Creates a shareable journey reference.
 */
shareRouter.post('/share', (req: Request, res: Response) => {
  const { trainId, fromStationId } = req.body || {};

  if (!trainId) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_REQUEST',
        message: 'trainId is required to create a shareable journey.',
        retryable: false
      }
    });
  }

  const result = sharingService.createShare(trainId, fromStationId);

  return res.json({
    success: true,
    data: result
  });
});

/**
 * GET /api/journeys/shared/:shareId
 * Resolves a shareable journey reference.
 */
shareRouter.get('/shared/:shareId', (req: Request, res: Response) => {
  const shareId = req.params.shareId;
  const share = sharingService.getShare(shareId);

  if (!share) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'SHARE_NOT_FOUND',
        message: 'The shared journey link has expired or is invalid.',
        retryable: false
      }
    });
  }

  return res.json({
    success: true,
    data: share
  });
});
