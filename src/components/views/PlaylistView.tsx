import React, { useMemo } from 'react';
import { Play, Pause, Shuffle, Trash2, Heart, Music, Clock, Film } from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';
import { DEMO_TRACKS, DEMO_PLAYLISTS, DEMO_ALBUMS } from '../../audio/demoCatalog';
import { TrackRow } from '../common/TrackRow';
import { KeycapButton } from '../common/KeycapButton';
import { formatTotalDuration } from '../../utils/formatters';
import type { Track } from '../../types/music';

export const PlaylistView: React.FC = () => {
  const {
    selectedPlaylistId,
    customPlaylists,
    likedTrackIds,
    recentTrackIds,
    getTrackById,
    playTrack,
    togglePlay,
    currentTrack,
    isPlaying,
    deletePlaylist,
    toggleLike,
  } = usePlayer();

  // Resolve playlist or collection data
  const collection = useMemo(() => {
    if (!selectedPlaylistId) return null;

    if (selectedPlaylistId === 'special-liked') {
      const tracks = likedTrackIds
        .map((id) => getTrackById(id) || DEMO_TRACKS.find((t) => t.id === id))
        .filter((t): t is Track => Boolean(t));
      return {
        id: 'special-liked',
        type: 'VAULT COLLECTION',
        title: 'Liked Songs',
        description: 'Your personal collection of favorited TFI tracks and cinema anthems',
        coverUrl: '/cinema/samantha-retro.jpg',
        tracks,
        isCustom: false,
      };
    }

    if (selectedPlaylistId === 'special-recent') {
      const tracks = recentTrackIds
        .map((id) => getTrackById(id) || DEMO_TRACKS.find((t) => t.id === id))
        .filter((t): t is Track => Boolean(t));
      return {
        id: 'special-recent',
        type: 'AUDIO TAPE HISTORY',
        title: 'Recently Played',
        description: 'Chronological playback history from your active listening sessions',
        coverUrl: '/cinema/og-pawan-kalyan.jpg',
        tracks,
        isCustom: false,
      };
    }

    // Check user custom playlists
    const custom = customPlaylists.find((p) => p.id === selectedPlaylistId);
    if (custom) {
      const tracks = custom.trackIds
        .map((id) => getTrackById(id) || DEMO_TRACKS.find((t) => t.id === id))
        .filter((t): t is Track => Boolean(t));
      return {
        id: custom.id,
        type: 'CUSTOM VAULT',
        title: custom.title,
        description: custom.description || 'Custom cinema playlist',
        coverUrl: custom.coverUrl,
        tracks,
        isCustom: true,
      };
    }

    // Check demo playlists
    const demo = DEMO_PLAYLISTS.find((p) => p.id === selectedPlaylistId);
    if (demo) {
      const tracks = DEMO_TRACKS.filter((t) => demo.trackIds.includes(t.id));
      return {
        id: demo.id,
        type: 'CURATED ARCHIVE',
        title: demo.title,
        description: demo.description,
        coverUrl: demo.coverUrl,
        tracks,
        isCustom: false,
      };
    }

    // Check albums
    const album = DEMO_ALBUMS.find((a) => a.id === selectedPlaylistId);
    if (album) {
      const tracks = DEMO_TRACKS.filter((t) => album.trackIds.includes(t.id));
      return {
        id: album.id,
        type: 'CINEMA SOUNDTRACK',
        title: album.title,
        description: `${album.artist} • Released ${album.year}`,
        coverUrl: album.coverUrl,
        tracks,
        isCustom: false,
      };
    }

    return null;
  }, [selectedPlaylistId, customPlaylists, likedTrackIds, recentTrackIds, getTrackById]);

  if (!collection) {
    return (
      <div className="py-20 text-center">
        <Film className="w-12 h-12 text-cinema-ivoryMuted/40 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-cinema-ivory font-display tracking-wider uppercase">
          Archive Not Found
        </h2>
        <p className="text-xs text-cinema-ivoryMuted mt-1 font-sans">
          Select another playlist or collection from the sidebar vault.
        </p>
      </div>
    );
  }

  const totalDuration = collection.tracks.reduce((acc, t) => acc + t.duration, 0);
  const isPlayingThisCollection =
    isPlaying && currentTrack && collection.tracks.some((t) => t.id === currentTrack.id);

  const handlePlayCollection = () => {
    if (collection.tracks.length === 0) return;
    if (isPlayingThisCollection) {
      togglePlay();
    } else {
      playTrack(collection.tracks[0], collection.tracks);
    }
  };

  const handleShuffleCollection = () => {
    if (collection.tracks.length === 0) return;
    const shuffled = [...collection.tracks].sort(() => Math.random() - 0.5);
    playTrack(shuffled[0], shuffled);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 sm:gap-6 pt-2 sm:pt-4 pb-5 sm:pb-6 border-b border-cinema-border/50">
        <div className="w-36 h-36 sm:w-48 sm:h-48 rounded-2xl overflow-hidden shadow-2xl bg-cinema-card flex-shrink-0 border-2 border-cinema-border/70 relative group">
          <img
            src={collection.coverUrl}
            alt={collection.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
        </div>

        <div className="flex-1 min-w-0 text-center sm:text-left space-y-2">
          <span className="text-[10px] font-mono font-bold tracking-widest text-cinema-gold uppercase px-2.5 py-1 rounded bg-cinema-panel border border-cinema-border/60">
            {collection.type}
          </span>
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-cinema-ivory tracking-wider uppercase truncate mt-2">
            {collection.title}
          </h1>
          <p className="text-xs sm:text-sm text-cinema-ivoryMuted max-w-2xl line-clamp-2 font-sans">
            {collection.description}
          </p>
          <div className="flex items-center justify-center sm:justify-start gap-2.5 text-xs text-cinema-ivoryMuted font-mono pt-1">
            <span className="text-cinema-gold font-bold">Sunara X TzionX</span>
            <span>•</span>
            <span>{collection.tracks.length} tracks</span>
            <span>•</span>
            <span className="tape-counter text-[10px]">{formatTotalDuration(totalDuration)}</span>
          </div>
        </div>
      </div>

      {/* Action Controls Keycaps */}
      <div className="flex items-center gap-3 py-2">
        <KeycapButton
          variant="primary"
          shape="circle"
          size="lg"
          onClick={handlePlayCollection}
          disabled={collection.tracks.length === 0}
          aria-label={isPlayingThisCollection ? 'Pause archive' : 'Play archive'}
          tooltip={isPlayingThisCollection ? 'Pause' : 'Play All'}
        >
          {isPlayingThisCollection ? (
            <Pause className="w-5 h-5 fill-current" />
          ) : (
            <Play className="w-5 h-5 fill-current ml-0.5" />
          )}
        </KeycapButton>

        <KeycapButton
          variant="deck"
          shape="circle"
          size="md"
          onClick={handleShuffleCollection}
          disabled={collection.tracks.length === 0}
          aria-label="Shuffle archive"
          tooltip="Shuffle Play"
          icon={<Shuffle className="w-4 h-4 text-cinema-gold" />}
        />

        {collection.id !== 'special-liked' && collection.tracks.length > 0 && (
          <KeycapButton
            variant="deck"
            shape="circle"
            size="md"
            onClick={() => {
              const allLiked = collection.tracks.every((t) => likedTrackIds.includes(t.id));
              collection.tracks.forEach((t) => {
                const isCurrentlyLiked = likedTrackIds.includes(t.id);
                if (allLiked && isCurrentlyLiked) {
                  toggleLike(t.id);
                } else if (!allLiked && !isCurrentlyLiked) {
                  toggleLike(t.id);
                }
              });
            }}
            aria-label={
              collection.tracks.every((t) => likedTrackIds.includes(t.id))
                ? 'Unlike all tracks in archive'
                : 'Like all tracks in archive'
            }
            tooltip="Like All"
            icon={
              <Heart
                className={`w-4 h-4 ${
                  collection.tracks.every((t) => likedTrackIds.includes(t.id))
                    ? 'fill-cinema-vermilion text-cinema-vermilion'
                    : 'text-cinema-ivoryMuted'
                }`}
              />
            }
          />
        )}

        {collection.isCustom && (
          <KeycapButton
            variant="danger"
            shape="square"
            size="sm"
            onClick={() => {
              if (window.confirm(`Delete archive "${collection.title}"?`)) {
                deletePlaylist(collection.id);
              }
            }}
            aria-label="Delete archive"
            tooltip="Delete Playlist"
            className="ml-auto"
            icon={<Trash2 className="w-3.5 h-3.5" />}
          >
            Delete
          </KeycapButton>
        )}
      </div>

      {/* Track List Table */}
      {collection.tracks.length === 0 ? (
        <div className="py-14 text-center cinema-panel rounded-2xl">
          <Music className="w-10 h-10 text-cinema-ivoryMuted/40 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-cinema-ivory font-display tracking-wider uppercase">
            This archive is empty
          </h3>
          <p className="text-xs text-cinema-ivoryMuted mt-1 font-sans">
            Browse Search or Cinema Home and click "+" on any track to add it here.
          </p>
        </div>
      ) : (
        <div className="space-y-1">
          {/* Table Header */}
          <div className="flex items-center px-4 py-2 text-xs font-mono font-bold uppercase tracking-widest text-cinema-gold/80 border-b border-cinema-border/50 select-none">
            <span className="w-8 flex-shrink-0 text-center">#</span>
            <span className="flex-1 mr-4">Title &amp; Artist</span>
            <span className="hidden md:block flex-1 mr-4">Soundtrack / Album</span>
            <span className="hidden lg:block w-36 mr-4">Genre</span>
            <span className="w-12 text-right flex items-center justify-end">
              <Clock className="w-3.5 h-3.5" />
            </span>
          </div>

          {/* Rows */}
          <div className="divide-y divide-cinema-border/20">
            {collection.tracks.map((track, idx) => (
              <TrackRow
                key={`${collection.id}-${track.id}-${idx}`}
                track={track}
                index={idx}
                tracksContext={collection.tracks}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
