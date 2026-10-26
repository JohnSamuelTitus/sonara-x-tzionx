import type { StoredUserData } from '../types/player';

const STORAGE_KEY = 'sonora_user_data_v1';

export const DEFAULT_USER_DATA: StoredUserData = {
  likedTrackIds: ['track-1', 'track-3'],
  recentTrackIds: ['track-1', 'track-2'],
  customPlaylists: [
    {
      id: 'pl-user-favorites',
      title: 'Midnight Focus',
      description: 'Handcrafted personal selections for deep night sessions',
      coverUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=300&q=80',
      trackIds: ['track-1', 'track-2', 'track-3'],
      createdAt: new Date().toISOString(),
    }
  ],
  volume: 0.8,
};

/**
 * Validates and sanitizes raw stored data, recovering gracefully from corruption or schema mismatch
 */
export function sanitizeUserData(raw: unknown): StoredUserData {
  if (!raw || typeof raw !== 'object') {
    return { ...DEFAULT_USER_DATA };
  }

  const obj = raw as Record<string, unknown>;

  const likedTrackIds = Array.isArray(obj.likedTrackIds)
    ? obj.likedTrackIds.filter((id): id is string => typeof id === 'string')
    : DEFAULT_USER_DATA.likedTrackIds;

  const recentTrackIds = Array.isArray(obj.recentTrackIds)
    ? obj.recentTrackIds.filter((id): id is string => typeof id === 'string').slice(0, 50)
    : DEFAULT_USER_DATA.recentTrackIds;

  const customPlaylists = Array.isArray(obj.customPlaylists)
    ? obj.customPlaylists.filter((p): p is StoredUserData['customPlaylists'][number] => {
        return (
          p &&
          typeof p === 'object' &&
          typeof p.id === 'string' &&
          typeof p.title === 'string' &&
          Array.isArray(p.trackIds)
        );
      }).map((p) => ({
        id: p.id,
        title: p.title || 'Untitled Playlist',
        description: typeof p.description === 'string' ? p.description : '',
        coverUrl: typeof p.coverUrl === 'string' && p.coverUrl.trim() !== '' 
          ? p.coverUrl 
          : 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&q=80',
        trackIds: p.trackIds.filter((tid): tid is string => typeof tid === 'string'),
        createdAt: typeof p.createdAt === 'string' ? p.createdAt : new Date().toISOString(),
      }))
    : DEFAULT_USER_DATA.customPlaylists;

  const rawVolume = typeof obj.volume === 'number' ? obj.volume : DEFAULT_USER_DATA.volume;
  const volume = Math.min(Math.max(isNaN(rawVolume) ? 0.8 : rawVolume, 0), 1);

  const savedTracks: Record<string, any> = {};
  if (obj.savedTracks && typeof obj.savedTracks === 'object') {
    for (const [k, v] of Object.entries(obj.savedTracks as Record<string, unknown>)) {
      if (v && typeof v === 'object' && typeof (v as any).id === 'string' && typeof (v as any).title === 'string') {
        savedTracks[k] = v;
      }
    }
  }

  return {
    likedTrackIds,
    recentTrackIds,
    customPlaylists,
    savedTracks,
    volume,
  };
}

export function loadUserData(): StoredUserData {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return { ...DEFAULT_USER_DATA };
    }
    const item = window.localStorage.getItem(STORAGE_KEY);
    if (!item) {
      return { ...DEFAULT_USER_DATA };
    }
    const parsed = JSON.parse(item);
    return sanitizeUserData(parsed);
  } catch (err) {
    console.warn('[Sonora Storage] Failed to load user data, resetting to safe defaults:', err);
    return { ...DEFAULT_USER_DATA };
  }
}

export function saveUserData(data: StoredUserData): boolean {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return false;
    }
    const sanitized = sanitizeUserData(data);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
    return true;
  } catch (err) {
    console.error('[Sonora Storage] Failed to persist user data:', err);
    return false;
  }
}
