import React, { createContext, useContext, useEffect, useRef, useState, useMemo, useCallback } from 'react';
import type { Track, Playlist } from '../types/music';
import type { PlayerState, RepeatMode } from '../types/player';
import { AudioEngine } from '../audio/AudioEngine';
import { YouTubePlayerEngine } from '../audio/YouTubePlayerEngine';
import { DEMO_TRACKS } from '../audio/demoCatalog';
import { loadUserData, saveUserData } from '../utils/storage';
import { checkYouTubeStatus } from '../audio/youtubeApiClient';

export type AppView = 'home' | 'search' | 'playlist' | 'queue' | 'category';

export interface PlayerContextValue extends PlayerState {
  likedTrackIds: string[];
  recentTrackIds: string[];
  customPlaylists: Playlist[];
  activeView: AppView;
  selectedPlaylistId: string | null;
  selectedCategoryId: string | null;
  searchQuery: string;
  isQueueOpen: boolean;
  isYouTubeActive: boolean;
  isYouTubeVideoVisible: boolean;
  isYouTubeConfigured: boolean;
  
  // Actions
  playTrack: (track: Track, customQueue?: Track[]) => Promise<void>;
  retryPlay: () => Promise<void>;
  togglePlay: () => void;
  seek: (seconds: number) => void;
  nextTrack: () => void;
  previousTrack: () => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  toggleLike: (trackId: string, trackObj?: Track) => void;
  isLiked: (trackId: string) => boolean;
  getTrackById: (trackId: string) => Track | undefined;
  
  createPlaylist: (title: string, description?: string) => Playlist;
  addTrackToPlaylist: (playlistId: string, trackId: string, trackObj?: Track) => void;
  removeTrackFromPlaylist: (playlistId: string, trackId: string) => void;
  deletePlaylist: (playlistId: string) => void;
  
  setActiveView: (view: AppView) => void;
  selectPlaylist: (playlistId: string) => void;
  selectCategory: (categoryId: string) => void;
  setSearchQuery: (query: string) => void;
  setIsQueueOpen: (open: boolean) => void;
  setIsYouTubeVideoVisible: (visible: boolean) => void;
  clearError: () => void;
}

const PlayerContext = createContext<PlayerContextValue | null>(null);

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userData, setUserData] = useState(() => loadUserData());
  const [activeView, setActiveView] = useState<AppView>('home');
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const [isYouTubeConfigured, setIsYouTubeConfigured] = useState(false);
  const [isYouTubeActive, setIsYouTubeActive] = useState(false);
  const [isYouTubeVideoVisible, setIsYouTubeVideoVisible] = useState(false);

  // In-memory track registry for dynamically discovered YouTube tracks
  const trackRegistryRef = useRef<Map<string, Track>>(new Map());

  // Initialize track registry with demo tracks and saved tracks from storage
  useEffect(() => {
    DEMO_TRACKS.forEach((t) => trackRegistryRef.current.set(t.id, t));
    if (userData.savedTracks) {
      Object.values(userData.savedTracks).forEach((t) => trackRegistryRef.current.set(t.id, t));
    }
  }, [userData.savedTracks]);

  // Check YouTube API configuration status once on mount
  useEffect(() => {
    checkYouTubeStatus().then((res) => {
      setIsYouTubeConfigured(res.configured);
    });
  }, []);

  // Core player state
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(userData.volume);
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('off');
  const [queue, setQueue] = useState<Track[]>(DEMO_TRACKS);
  const [queueIndex, setQueueIndex] = useState<number>(0);
  const [shuffleHistory, setShuffleHistory] = useState<number[]>([]);
  const [history, setHistory] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Engines
  const audioEngineRef = useRef<AudioEngine | null>(null);
  const youtubeEngineRef = useRef<YouTubePlayerEngine | null>(null);

  // Refs to eliminate stale closure bugs in callbacks
  const callbacksRef = useRef({
    onTimeUpdate: (_time: number) => {},
    onDurationChange: (_dur: number) => {},
    onPlayStateChange: (_playing: boolean) => {},
    onLoadingChange: (_loading: boolean) => {},
    onError: (_err: string) => {},
    onEnded: () => {},
  });

  const stateRef = useRef({
    currentTrack,
    queue,
    queueIndex,
    repeatMode,
    isShuffle,
    shuffleHistory,
    currentTime,
    duration,
    volume,
    isMuted,
    isPlaying,
    isYouTubeActive,
  });

  stateRef.current = {
    currentTrack,
    queue,
    queueIndex,
    repeatMode,
    isShuffle,
    shuffleHistory,
    currentTime,
    duration,
    volume,
    isMuted,
    isPlaying,
    isYouTubeActive,
  };

  // Helper to resolve track by ID from registry
  const getTrackById = useCallback((trackId: string): Track | undefined => {
    return trackRegistryRef.current.get(trackId);
  }, []);

  // Seek helper
  const seek = useCallback((seconds: number) => {
    if (stateRef.current.isYouTubeActive && youtubeEngineRef.current) {
      youtubeEngineRef.current.seek(seconds);
    } else if (audioEngineRef.current) {
      audioEngineRef.current.seek(seconds);
    }
    setCurrentTime(seconds);
  }, []);

  // Play track implementation supporting both local audio and YouTube video
  const playTrack = useCallback(async (track: Track, customQueue?: Track[]) => {
    // Register track in memory and storage so it always resolves
    trackRegistryRef.current.set(track.id, track);

    let newQueue = stateRef.current.queue;
    let newIndex = 0;

    if (customQueue && customQueue.length > 0) {
      newQueue = customQueue;
      customQueue.forEach((t) => trackRegistryRef.current.set(t.id, t));
      newIndex = customQueue.findIndex((t) => t.id === track.id);
      if (newIndex === -1) {
        newQueue = [track, ...customQueue];
        newIndex = 0;
      }
      setQueue(newQueue);
    } else {
      newIndex = newQueue.findIndex((t) => t.id === track.id);
      if (newIndex === -1) {
        newQueue = [...newQueue, track];
        newIndex = newQueue.length - 1;
        setQueue(newQueue);
      }
    }

    setQueueIndex(newIndex);
    setCurrentTrack(track);
    setError(null);
    setIsLoading(true);
    setCurrentTime(0);
    setDuration(track.duration || 0);

    // Save track metadata into user data for persistence
    setUserData((prev) => {
      const savedTracks = { ...(prev.savedTracks || {}), [track.id]: track };
      const next = { ...prev, savedTracks };
      saveUserData(next);
      return next;
    });

    // Record in history for in-memory session
    setHistory((prev) => [track, ...prev.filter((t) => t.id !== track.id)].slice(0, 30));

    const isYouTube = track.provider === 'youtube' || Boolean(track.videoId) || track.id.startsWith('yt-');
    setIsYouTubeActive(isYouTube);
    if (isYouTube) {
      setIsYouTubeVideoVisible(true);
    }

    try {
      if (isYouTube) {
        // Pause local audio engine before switching to YouTube
        audioEngineRef.current?.pause();
        if (youtubeEngineRef.current) {
          await youtubeEngineRef.current.loadTrack(track, true);
        }
      } else {
        // Pause YouTube engine before switching to local audio
        youtubeEngineRef.current?.pause();
        if (audioEngineRef.current) {
          await audioEngineRef.current.loadTrack(track, true);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Playback failed';
      setError(msg);
      setIsPlaying(false);
      setIsLoading(false);
    }
  }, []);

  // Retry playback for current track
  const retryPlay = useCallback(async () => {
    const track = stateRef.current.currentTrack;
    if (!track) return;
    setError(null);
    setIsLoading(true);

    const isYouTube = track.provider === 'youtube' || Boolean(track.videoId) || track.id.startsWith('yt-');
    try {
      if (isYouTube && youtubeEngineRef.current) {
        await youtubeEngineRef.current.loadTrack(track, true);
      } else if (audioEngineRef.current) {
        await audioEngineRef.current.loadTrack(track, true);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Retry playback failed';
      setError(msg);
      setIsPlaying(false);
      setIsLoading(false);
    }
  }, []);

  // Next track implementation with coherent shuffle and repeat support
  const nextTrack = useCallback((isAutoEnded = false) => {
    const { queue: currentQueue, queueIndex: currentIdx, isShuffle: shuffleOn, repeatMode: repeat, shuffleHistory: historyList } = stateRef.current;
    if (currentQueue.length === 0) return;

    if (shuffleOn) {
      setShuffleHistory([...historyList, currentIdx]);
      const availableIndices = currentQueue.map((_, i) => i).filter((i) => i !== currentIdx);
      if (availableIndices.length > 0) {
        const randIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
        playTrack(currentQueue[randIndex]);
        return;
      }
    }

    let nextIdx = currentIdx + 1;
    if (nextIdx >= currentQueue.length) {
      if (repeat === 'all') {
        nextIdx = 0;
      } else {
        if (isAutoEnded) {
          setIsPlaying(false);
          setIsLoading(false);
          seek(0);
        } else {
          audioEngineRef.current?.pause();
          youtubeEngineRef.current?.pause();
          setIsPlaying(false);
        }
        return;
      }
    }
    playTrack(currentQueue[nextIdx]);
  }, [playTrack, seek]);

  // Previous track implementation
  const previousTrack = useCallback(() => {
    const { queue: currentQueue, queueIndex: currentIdx, currentTime: currTime, isShuffle: shuffleOn, shuffleHistory: historyList, repeatMode: repeat } = stateRef.current;
    if (currentQueue.length === 0) return;

    if (currTime > 3) {
      seek(0);
      return;
    }

    if (shuffleOn && historyList.length > 0) {
      const prevIdx = historyList[historyList.length - 1];
      setShuffleHistory(historyList.slice(0, -1));
      playTrack(currentQueue[prevIdx]);
      return;
    }

    let prevIdx = currentIdx - 1;
    if (prevIdx < 0) {
      prevIdx = repeat === 'all' ? currentQueue.length - 1 : 0;
    }
    playTrack(currentQueue[prevIdx]);
  }, [seek, playTrack]);

  // Handle track ended
  const handleTrackEnded = useCallback(() => {
    const { repeatMode: repeat, currentTrack: track, isYouTubeActive: ytActive } = stateRef.current;
    if (repeat === 'one' && track) {
      seek(0);
      if (ytActive) {
        youtubeEngineRef.current?.play();
      } else {
        audioEngineRef.current?.play();
      }
      return;
    }
    nextTrack(true);
  }, [seek, nextTrack]);

  // Update callbacksRef on each render
  useEffect(() => {
    callbacksRef.current = {
      onTimeUpdate: (time) => setCurrentTime(time),
      onDurationChange: (dur) => setDuration(dur),
      onLoadingChange: (loading) => setIsLoading(loading),
      onError: (err) => {
        setError(err);
        setIsPlaying(false);
        setIsLoading(false);
      },
      onPlayStateChange: (playing) => {
        setIsPlaying(playing);
        if (playing) {
          setIsLoading(false);
          setError(null);
          // Genuine playback confirmed: record in recently played
          const track = stateRef.current.currentTrack;
          if (track) {
            setUserData((prev) => {
              if (prev.recentTrackIds[0] === track.id) return prev;
              const recents = [track.id, ...prev.recentTrackIds.filter((id) => id !== track.id)].slice(0, 50);
              const savedTracks = { ...(prev.savedTracks || {}), [track.id]: track };
              const next = { ...prev, recentTrackIds: recents, savedTracks };
              saveUserData(next);
              return next;
            });
          }
        }
      },
      onEnded: () => {
        handleTrackEnded();
      },
    };
  }, [handleTrackEnded]);

  // Initialize both engines once
  useEffect(() => {
    // 1. AudioEngine for local/stream tracks
    const audio = new AudioEngine();
    audioEngineRef.current = audio;
    audio.setVolume(userData.volume);
    audio.setCallbacks({
      onTimeUpdate: (t) => callbacksRef.current.onTimeUpdate(t),
      onDurationChange: (d) => callbacksRef.current.onDurationChange(d),
      onPlayStateChange: (p) => callbacksRef.current.onPlayStateChange(p),
      onLoadingChange: (l) => callbacksRef.current.onLoadingChange(l),
      onError: (e) => callbacksRef.current.onError(e),
      onEnded: () => callbacksRef.current.onEnded(),
    });

    // 2. YouTubePlayerEngine for YouTube video playback
    const yt = new YouTubePlayerEngine('sonora-youtube-player-iframe');
    youtubeEngineRef.current = yt;
    yt.setVolume(userData.volume);
    yt.setCallbacks({
      onTimeUpdate: (t) => callbacksRef.current.onTimeUpdate(t),
      onDurationChange: (d) => callbacksRef.current.onDurationChange(d),
      onPlayStateChange: (p) => callbacksRef.current.onPlayStateChange(p),
      onLoadingChange: (l) => callbacksRef.current.onLoadingChange(l),
      onError: (e) => callbacksRef.current.onError(e),
      onEnded: () => callbacksRef.current.onEnded(),
    });

    return () => {
      audio.destroy();
      yt.destroy();
    };
  }, []);

  // Update volume across engines and persistence
  const setVolume = useCallback((newVol: number) => {
    const clamped = Math.max(0, Math.min(newVol, 1));
    setVolumeState(clamped);
    if (clamped > 0 && isMuted) {
      setIsMuted(false);
      audioEngineRef.current?.setMuted(false);
      youtubeEngineRef.current?.setMuted(false);
    }
    audioEngineRef.current?.setVolume(clamped);
    youtubeEngineRef.current?.setVolume(clamped);

    setUserData((prev) => {
      const next = { ...prev, volume: clamped };
      saveUserData(next);
      return next;
    });
  }, [isMuted]);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      audioEngineRef.current?.setMuted(next);
      youtubeEngineRef.current?.setMuted(next);
      return next;
    });
  }, []);

  const togglePlay = useCallback(() => {
    const { currentTrack: track, isPlaying: playing, queue: currentQueue, isYouTubeActive: ytActive } = stateRef.current;
    if (!track) {
      if (currentQueue.length > 0) {
        playTrack(currentQueue[0]);
      }
      return;
    }

    if (ytActive && youtubeEngineRef.current) {
      if (playing) {
        youtubeEngineRef.current.pause();
      } else {
        youtubeEngineRef.current.play();
      }
    } else if (audioEngineRef.current) {
      if (playing) {
        audioEngineRef.current.pause();
      } else {
        audioEngineRef.current.play();
      }
    }
  }, [playTrack]);

  const toggleShuffle = useCallback(() => {
    setIsShuffle((prev) => {
      const next = !prev;
      if (!next) {
        setShuffleHistory([]);
      }
      return next;
    });
  }, []);

  const toggleRepeat = useCallback(() => {
    setRepeatMode((prev) => {
      if (prev === 'off') return 'all';
      if (prev === 'all') return 'one';
      return 'off';
    });
  }, []);

  const isLiked = useCallback((trackId: string) => {
    return userData.likedTrackIds.includes(trackId);
  }, [userData.likedTrackIds]);

  const toggleLike = useCallback((trackId: string, trackObj?: Track) => {
    if (trackObj) {
      trackRegistryRef.current.set(trackId, trackObj);
    }

    setUserData((prev) => {
      const exists = prev.likedTrackIds.includes(trackId);
      const likedTrackIds = exists
        ? prev.likedTrackIds.filter((id) => id !== trackId)
        : [...prev.likedTrackIds, trackId];

      const savedTracks = { ...(prev.savedTracks || {}) };
      if (trackObj) {
        savedTracks[trackId] = trackObj;
      }

      const next = { ...prev, likedTrackIds, savedTracks };
      saveUserData(next);
      return next;
    });
  }, []);

  // Playlist management
  const customPlaylists = useMemo(() => {
    return userData.customPlaylists.map((p) => ({
      ...p,
      isUserCreated: true,
    }));
  }, [userData.customPlaylists]);

  const createPlaylist = useCallback((title: string, description = '') => {
    const newPlaylist: Playlist = {
      id: `pl-user-${Date.now()}`,
      title: title.trim() || 'My Playlist',
      description: description.trim(),
      coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&q=80',
      trackIds: [],
      isUserCreated: true,
      createdAt: new Date().toISOString(),
    };

    setUserData((prev) => {
      const next = {
        ...prev,
        customPlaylists: [newPlaylist, ...prev.customPlaylists],
      };
      saveUserData(next);
      return next;
    });

    return newPlaylist;
  }, []);

  const addTrackToPlaylist = useCallback((playlistId: string, trackId: string, trackObj?: Track) => {
    if (trackObj) {
      trackRegistryRef.current.set(trackId, trackObj);
    }

    setUserData((prev) => {
      const customPlaylists = prev.customPlaylists.map((p) => {
        if (p.id === playlistId && !p.trackIds.includes(trackId)) {
          return { ...p, trackIds: [...p.trackIds, trackId] };
        }
        return p;
      });

      const savedTracks = { ...(prev.savedTracks || {}) };
      if (trackObj) {
        savedTracks[trackId] = trackObj;
      }

      const next = { ...prev, customPlaylists, savedTracks };
      saveUserData(next);
      return next;
    });
  }, []);

  const removeTrackFromPlaylist = useCallback((playlistId: string, trackId: string) => {
    setUserData((prev) => {
      const customPlaylists = prev.customPlaylists.map((p) => {
        if (p.id === playlistId) {
          return { ...p, trackIds: p.trackIds.filter((id) => id !== trackId) };
        }
        return p;
      });
      const next = { ...prev, customPlaylists };
      saveUserData(next);
      return next;
    });
  }, []);

  const deletePlaylist = useCallback((playlistId: string) => {
    setUserData((prev) => {
      const customPlaylists = prev.customPlaylists.filter((p) => p.id !== playlistId);
      const next = { ...prev, customPlaylists };
      saveUserData(next);
      return next;
    });
    if (selectedPlaylistId === playlistId) {
      setSelectedPlaylistId(null);
      setActiveView('home');
    }
  }, [selectedPlaylistId]);

  const selectPlaylist = useCallback((playlistId: string) => {
    setSelectedPlaylistId(playlistId);
    setActiveView('playlist');
  }, []);

  const selectCategory = useCallback((categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setActiveView('category');
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Stable ref for keyboard shortcuts
  const keyboardRef = useRef({
    togglePlay,
    seek,
    setVolume,
    toggleMute,
  });

  useEffect(() => {
    keyboardRef.current = {
      togglePlay,
      seek,
      setVolume,
      toggleMute,
    };
  });

  // Global Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement)?.isContentEditable
      ) {
        return;
      }

      const { togglePlay: tp, seek: sk, setVolume: sv, toggleMute: tm } = keyboardRef.current;
      const { currentTime: cTime, duration: dur, volume: vol } = stateRef.current;

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          tp();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          sk(Math.max(0, cTime - 5));
          break;
        case 'ArrowRight':
          e.preventDefault();
          sk(Math.min(dur, cTime + 5));
          break;
        case 'ArrowUp':
          e.preventDefault();
          sv(Math.min(1, vol + 0.05));
          break;
        case 'ArrowDown':
          e.preventDefault();
          sv(Math.max(0, vol - 0.05));
          break;
        case 'KeyM':
          e.preventDefault();
          tm();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const value: PlayerContextValue = {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isShuffle,
    repeatMode,
    queue,
    queueIndex,
    history,
    isLoading,
    error,
    isYouTubeActive,
    isYouTubeVideoVisible,
    isYouTubeConfigured,
    likedTrackIds: userData.likedTrackIds,
    recentTrackIds: userData.recentTrackIds,
    customPlaylists,
    activeView,
    selectedPlaylistId,
    selectedCategoryId,
    searchQuery,
    isQueueOpen,
    playTrack,
    retryPlay,
    togglePlay,
    seek,
    nextTrack,
    previousTrack,
    setVolume,
    toggleMute,
    toggleShuffle,
    toggleRepeat,
    toggleLike,
    isLiked,
    getTrackById,
    createPlaylist,
    addTrackToPlaylist,
    removeTrackFromPlaylist,
    deletePlaylist,
    setActiveView,
    selectPlaylist,
    selectCategory,
    setSearchQuery,
    setIsQueueOpen,
    setIsYouTubeVideoVisible,
    clearError,
  };

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
};

export const usePlayer = (): PlayerContextValue => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};
