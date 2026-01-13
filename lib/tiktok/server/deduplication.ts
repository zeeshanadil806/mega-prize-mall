import { TikTokEventModel } from '@/models/TikTokEvent'; // We'll create this model

export interface DeduplicationRecord {
  id: string;
  event_id: string;
  event_type: string;
  source: 'client' | 'server' | 'conversion_api';
  user_id?: string;
  created_at: Date;
  expires_at: Date;
}

export interface DeduplicationQuery {
  event_id?: string;
  user_id?: string;
  created_at?: { $gte?: Date; $lt?: Date };
  expires_at?: { $lt?: Date };
}

export class DeduplicationService {
  /**
   * Check if event was already processed
   */
  async isDuplicate(eventId: string): Promise<boolean> {
    try {
      const existing = await TikTokEventModel.findOne({ event_id: eventId });
      return !!existing;
    } catch (error) {
      console.error('Failed to check duplicate event:', error);
      return false;
    }
  }

  /**
   * Record event to prevent duplicates
   */
  async recordEvent(
    eventId: string,
    eventType: string,
    source: 'client' | 'server' | 'conversion_api',
    userId?: string
  ): Promise<void> {
    try {
      // Store in MongoDB with 30-day TTL
      await TikTokEventModel.create({
        event_id: eventId,
        event_type: eventType,
        source,
        user_id: userId,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      });
    } catch (error) {
      // Duplicate key error (MongoDB error code 11000)
      if (error instanceof Error) {
        console.log(`Duplicate event detected and ignored: ${eventId}`);
      } else {
        console.error('Failed to record TikTok event:', error);
      }
    }
  }

  /**
   * Clean up old events
   */
  async cleanupOldEvents(): Promise<void> {
    try {
      await TikTokEventModel.deleteMany({
        expires_at: { $lt: new Date() },
      });
    } catch (error) {
      console.error('Failed to cleanup old TikTok events:', error);
    }
  }

  /**
   * Get event statistics
   */
  async getStats(): Promise<{
    total: number;
    last24h: number;
    byType: Record<string, number>;
  }> {
    try {
      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      const [total, last24h, byType] = await Promise.all([
        TikTokEventModel.countDocuments(),
        TikTokEventModel.countDocuments({ created_at: { $gte: yesterday } }),
        TikTokEventModel.aggregate([
          {
            $group: {
              _id: '$event_type',
              count: { $sum: 1 },
            },
          },
        ]),
      ]);

      const byTypeMap: Record<string, number> = {};
byType.forEach((item: { _id: string; count: number }) => {
        byTypeMap[item._id] = item.count;
      });

      return {
        total,
        last24h,
        byType: byTypeMap,
      };
    } catch (error) {
      console.error('Failed to get TikTok event stats:', error);
      return { total: 0, last24h: 0, byType: {} };
    }
  }
}

// Singleton instance
export const deduplicationService = new DeduplicationService();