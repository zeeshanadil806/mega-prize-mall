import { randomBytes } from 'crypto';

/**
 * Generate unique event ID for deduplication
 * Format: [entity]_[action]_[timestamp]_[random]
 */
export function generateEventId(
  entity: string,
  action: string,
  userId?: string
): string {
  const timestamp = Date.now();
  const random = randomBytes(4).toString('hex').slice(0, 8);
  const userPrefix = userId ? `${userId.slice(0, 4)}_` : '';
  
  return `${userPrefix}${entity}_${action}_${timestamp}_${random}`.toLowerCase();
}

/**
 * Store event ID in session storage for deduplication
 */
export function storeEventId(eventId: string, eventType: string): void {
  if (typeof window === 'undefined') return;
  
  try {
    const storedEvents = JSON.parse(
      sessionStorage.getItem('tiktok_events') || '[]'
    );
    
    // Keep only last 50 events to prevent storage bloat
    const updatedEvents = [
      { id: eventId, type: eventType, timestamp: Date.now() },
      ...storedEvents.slice(0, 49)
    ];
    
    sessionStorage.setItem('tiktok_events', JSON.stringify(updatedEvents));
  } catch (error) {
    console.warn('Failed to store TikTok event ID:', error);
  }
}

/**
 * Check if event ID already exists (prevent duplicates)
 */
interface StoredEvent {
  id: string;
  type: string;
  timestamp: number;
}

export function isDuplicateEvent(eventId: string): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    const storedEvents = JSON.parse(
      sessionStorage.getItem('tiktok_events') || '[]'
    );
    return storedEvents.some((event: StoredEvent) => event.id === eventId);
  } catch {
    return false;
  }
}