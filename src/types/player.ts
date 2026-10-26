import type { Track } from './music';

export type RepeatMode = 'off' | 'all' | 'one';

export interface PlayerState {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number; // 0 to 1
  isMuted: boolean;
  isShuffle: boolean;
  repeatMode: RepeatMode;
  queue: Track[];
  queueIndex: number;
  history: Track[];
  isLoading: boolean;
  error: string | null;
  isYouTubeActive?: boolean;
}

export interface StoredUserData {
  likedTrackIds: string[];
  recentTrackIds: string[];
  customPlaylists: Array<{
    id: string;
    title: string;
    description: string;
    coverUrl: string;
    trackIds: string[];
    createdAt: string;
  }>;
  savedTracks?: Record<string, Track>;
  volume: number;
}

export interface AudioSourceProvider {
  name: string;
  isAvailable(): boolean;
  resolveAudioUrl(track: Track): Promise<string>;
}
