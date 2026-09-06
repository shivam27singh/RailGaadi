import { ShareJourneyResponse } from '@railgaddi/types';

interface SharedJourneyRecord {
  shareId: string;
  trainId: string;
  fromStationId?: string;
  createdAt: string;
}

export class SharingService {
  private shares: Map<string, SharedJourneyRecord> = new Map();

  constructor() {
    // Seed initial share demo
    this.shares.set('live12951', {
      shareId: 'live12951',
      trainId: '12951',
      createdAt: new Date().toISOString()
    });
  }

  public createShare(trainId: string, fromStationId?: string): ShareJourneyResponse {
    // Generate clean alphanumeric shareId
    const shareId = `${trainId.toLowerCase()}-${Math.random().toString(36).substring(2, 7)}`;
    const record: SharedJourneyRecord = {
      shareId,
      trainId,
      fromStationId,
      createdAt: new Date().toISOString()
    };

    this.shares.set(shareId, record);

    return {
      shareId,
      trainId,
      url: `/journey/${trainId}?shareId=${shareId}`,
      createdAt: record.createdAt
    };
  }

  public getShare(shareId: string): SharedJourneyRecord | null {
    return this.shares.get(shareId) || null;
  }
}

export const sharingService = new SharingService();
