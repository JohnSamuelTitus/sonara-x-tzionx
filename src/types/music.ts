export type TrackProvider = 'local' | 'stream' | 'youtube';

export interface Track {
  id: string;
  provider?: TrackProvider;
  title: string;
  artist: string;
  album: string;
  duration: number; // Duration in seconds (or 0 when pending provider load)
  coverUrl: string;
  audioUrl?: string; // For local/remote HTMLAudioElement
  videoId?: string; // YouTube video identifier (e.g., dQw4w9WgXcQ)
  genre?: string;
  licenseInfo?: string;
  isLocal?: boolean;
}

export interface Playlist {
  id: string;
  title: string;
  description: string;
  coverUrl: string;
  trackIds: string[];
  isUserCreated: boolean;
  createdAt: string;
}

export interface Album {
  id: string;
  title: string;
  artist: string;
  year: number;
  coverUrl: string;
  trackIds: string[];
}

export interface Genre {
  id: string;
  name: string;
  color: string;
}

export interface MusicCategory {
  id: string;
  title: string;
  subtitle: string;
  query: string;
}
