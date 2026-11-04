import mongoose, { Schema, Document } from 'mongoose';

export interface ITikTokEvent extends Document {
  event_id: string;
  event_type: string;
  source: 'client' | 'server' | 'conversion_api';
  user_id?: string;
  created_at: Date;
  expires_at: Date;
}

const TikTokEventSchema: Schema = new Schema({
  event_id: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  event_type: {
    type: String,
    required: true,
    index: true,
  },
  source: {
    type: String,
    enum: ['client', 'server', 'conversion_api'],
    required: true,
  },
  user_id: {
    type: String,
    index: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  expires_at: {
    type: Date,
    required: true,
  },
}, {
  timestamps: true,
});

// Create TTL index for automatic expiry (30 days)
TikTokEventSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });

// Create compound indexes for better query performance
TikTokEventSchema.index({ event_type: 1, created_at: -1 });
TikTokEventSchema.index({ user_id: 1, created_at: -1 });

export const TikTokEventModel = mongoose.models.TikTokEvent || 
  mongoose.model<ITikTokEvent>('TikTokEvent', TikTokEventSchema);