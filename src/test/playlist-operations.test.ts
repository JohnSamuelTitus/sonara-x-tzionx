import { describe, it, expect } from 'vitest';
import type { Playlist, Track } from '../types/music';

describe('playlist operations & calculations', () => {
  const tracks: Track[] = [
    { id: 't-1', title: 'T1', artist: 'A1', album: 'Alb', duration: 120, coverUrl: '', audioUrl: '', genre: 'Lo-Fi', licenseInfo: '' },
    { id: 't-2', title: 'T2', artist: 'A2', album: 'Alb', duration: 180, coverUrl: '', audioUrl: '', genre: 'Ambient', licenseInfo: '' },
    { id: 't-3', title: 'T3', artist: 'A3', album: 'Alb', duration: 300, coverUrl: '', audioUrl: '', genre: 'Synthwave', licenseInfo: '' },
  ];

  it('creates a new custom playlist with metadata', () => {
    const newPlaylist: Playlist = {
      id: 'pl-custom-1',
      title: 'Deep Night',
      description: 'Music for late coding',
      coverUrl: 'https://example.com/cover.jpg',
      trackIds: [],
      isUserCreated: true,
      createdAt: new Date().toISOString(),
    };

    expect(newPlaylist.title).toBe('Deep Night');
    expect(newPlaylist.isUserCreated).toBe(true);
    expect(newPlaylist.trackIds).toHaveLength(0);
  });

  it('adds tracks without creating duplicates', () => {
    let playlist: Playlist = {
      id: 'pl-1',
      title: 'Favorites',
      description: '',
      coverUrl: '',
      trackIds: ['t-1'],
      isUserCreated: true,
      createdAt: '',
    };

    const addTrack = (pl: Playlist, trackId: string): Playlist => {
      if (pl.trackIds.includes(trackId)) return pl;
      return { ...pl, trackIds: [...pl.trackIds, trackId] };
    };

    playlist = addTrack(playlist, 't-2');
    expect(playlist.trackIds).toEqual(['t-1', 't-2']);

    // Attempt duplicate add
    playlist = addTrack(playlist, 't-2');
    expect(playlist.trackIds).toEqual(['t-1', 't-2']);
  });

  it('removes a track from a playlist', () => {
    const playlist: Playlist = {
      id: 'pl-1',
      title: 'Favorites',
      description: '',
      coverUrl: '',
      trackIds: ['t-1', 't-2', 't-3'],
      isUserCreated: true,
      createdAt: '',
    };

    const removeTrack = (pl: Playlist, trackId: string): Playlist => {
      return { ...pl, trackIds: pl.trackIds.filter((id) => id !== trackId) };
    };

    const updated = removeTrack(playlist, 't-2');
    expect(updated.trackIds).toEqual(['t-1', 't-3']);
  });

  it('accurately computes total duration and track count', () => {
    const playlistTrackIds = ['t-1', 't-3'];
    const playlistTracks = tracks.filter((t) => playlistTrackIds.includes(t.id));

    const totalDuration = playlistTracks.reduce((acc, t) => acc + t.duration, 0);

    expect(playlistTracks).toHaveLength(2);
    expect(totalDuration).toBe(420); // 120 + 300 = 420 seconds (7 minutes)
  });
});
