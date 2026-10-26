import React, { useState } from 'react';
import { Play, Heart, Plus, Check } from 'lucide-react';
import type { Track } from '../../types/music';
import { formatTime } from '../../utils/formatters';
import { usePlayer } from '../../context/PlayerContext';

interface TrackRowProps {
  track: Track;
  index: number;
  tracksContext?: Track[];
}

export const TrackRow: React.FC<TrackRowProps> = ({ track, index, tracksContext }) => {
  const {
    currentTrack,
    isPlaying,
    playTrack,
    togglePlay,
    isLiked,
    toggleLike,
    customPlaylists,
    addTrackToPlaylist,
  } = usePlayer();
  const [showPlaylistMenu, setShowPlaylistMenu] = useState(false);
  const [addedMessage, setAddedMessage] = useState<string | null>(null);

  const isCurrent = currentTrack?.id === track.id;
  const isPlayingCurrent = isCurrent && isPlaying;
  const liked = isLiked(track.id);

  const handleRowClick = () => {
    if (isCurrent) {
      togglePlay();
    } else {
      playTrack(track, tracksContext);
    }
  };

  const handleAddToPlaylist = (playlistId: string, playlistTitle: string) => {
    addTrackToPlaylist(playlistId, track.id, track);
    setShowPlaylistMenu(false);
    setAddedMessage(`Added to ${playlistTitle}`);
    setTimeout(() => setAddedMessage(null), 2500);
  };

  return (
    <div
      role="row"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          handleRowClick();
        }
      }}
      className={`group relative flex items-center px-4 py-2.5 rounded-xl text-sm transition-all duration-150 cursor-pointer border ${
        isCurrent
          ? 'bg-cinema-wine/40 border-cinema-gold/40 text-cinema-gold font-medium shadow-inner'
          : 'bg-cinema-panel/20 border-transparent hover:bg-cinema-panel/70 hover:border-cinema-border/50 text-cinema-ivory'
      }`}
      onClick={handleRowClick}
    >
      {/* Index or Stereo Equalizer Indicator */}
      <div className="w-8 flex-shrink-0 flex items-center justify-center text-xs font-mono text-cinema-ivoryMuted">
        {isPlayingCurrent ? (
          <div className="flex items-end gap-0.5 h-3.5 w-3.5" aria-label="Now playing">
            <span className="w-1 bg-cinema-gold rounded-full animate-equalizer" style={{ animationDelay: '0ms' }} />
            <span className="w-1 bg-cinema-vermilion rounded-full animate-equalizer" style={{ animationDelay: '200ms' }} />
            <span className="w-1 bg-cinema-gold rounded-full animate-equalizer" style={{ animationDelay: '400ms' }} />
          </div>
        ) : (
          <>
            <span className="group-hover:hidden text-[11px] font-mono text-cinema-ivoryMuted/70">{index + 1}</span>
            <button
              type="button"
              aria-label={`Play ${track.title}`}
              className="keycap-base keycap-circle w-6 h-6 keycap-primary text-white hidden group-hover:flex items-center justify-center"
            >
              <Play className="w-3 h-3 fill-current ml-0.5" />
            </button>
          </>
        )}
      </div>

      {/* Cover Artwork & Details */}
      <div className="flex items-center gap-3 min-w-0 flex-1 mr-4">
        <img
          src={track.coverUrl}
          alt={track.title}
          className="w-10 h-10 rounded-lg object-cover flex-shrink-0 bg-cinema-card border border-cinema-border/40 shadow-sm"
          loading="lazy"
        />
        <div className="min-w-0">
          <p
            className={`truncate text-xs sm:text-sm font-bold font-sans ${
              isCurrent ? 'text-cinema-gold' : 'text-cinema-ivory group-hover:text-cinema-gold'
            } transition-colors`}
          >
            {track.title}
          </p>
          <p className="truncate text-xs text-cinema-ivoryMuted hover:underline mt-0.5 font-sans">
            {track.artist}
          </p>
        </div>
      </div>

      {/* Album Name */}
      <div className="hidden md:block flex-1 min-w-0 text-xs text-cinema-ivoryMuted/80 truncate mr-4 font-sans">
        {track.album}
      </div>

      {/* Genre / Cinema Badge (Replaces developer technical labels) */}
      <div className="hidden lg:block w-36 flex-shrink-0 text-[11px] text-cinema-ivoryMuted truncate mr-4">
        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase bg-cinema-panel border border-cinema-border/60 text-cinema-gold">
          {track.genre || 'TFI Audio'}
        </span>
      </div>

      {/* Actions: Like, Add to playlist, Tape duration */}
      <div
        className="flex items-center gap-3 text-xs text-cinema-ivoryMuted flex-shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Like Keycap */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleLike(track.id, track);
          }}
          aria-label={liked ? `Unlike ${track.title}` : `Like ${track.title}`}
          className={`keycap-base keycap-circle w-7 h-7 flex items-center justify-center transition-all ${
            liked
              ? 'keycap-primary text-white opacity-100'
              : 'keycap-deck text-cinema-ivoryMuted opacity-60 sm:opacity-0 group-hover:opacity-100 hover:text-white'
          }`}
        >
          <Heart className={`w-3.5 h-3.5 ${liked ? 'fill-current' : ''}`} />
        </button>

        {/* Add to Playlist Keycap */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowPlaylistMenu((prev) => !prev)}
            aria-label={`Add ${track.title} to playlist`}
            className="keycap-base keycap-circle w-7 h-7 keycap-deck text-cinema-ivoryMuted hover:text-cinema-gold flex items-center justify-center opacity-70 sm:opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>

          {showPlaylistMenu && (
            <div className="absolute right-0 bottom-full mb-1 w-48 bg-cinema-card border border-cinema-border rounded-xl shadow-2xl p-1.5 z-50 text-xs">
              <p className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-cinema-gold font-bold">
                Add to vault
              </p>
              {customPlaylists.length === 0 ? (
                <p className="px-2 py-1.5 text-cinema-ivoryMuted italic text-[11px]">No custom playlists yet</p>
              ) : (
                customPlaylists.map((pl) => (
                  <button
                    key={pl.id}
                    type="button"
                    onClick={() => handleAddToPlaylist(pl.id, pl.title)}
                    className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-cinema-panel text-cinema-ivory truncate flex items-center justify-between"
                  >
                    <span className="truncate">{pl.title}</span>
                    {pl.trackIds.includes(track.id) && <Check className="w-3 h-3 text-cinema-gold" />}
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Duration in tape-counter font */}
        <span className="w-12 text-right tabular-nums font-mono text-[11px] text-cinema-gold/90">
          {formatTime(track.duration)}
        </span>
      </div>

      {/* Temporary Feedback Notification Toast */}
      {addedMessage && (
        <span className="absolute right-2 -top-6 bg-cinema-gold text-cinema-charcoal text-[11px] font-mono font-bold px-2 py-0.5 rounded shadow-lg pointer-events-none z-50 animate-bounce">
          {addedMessage}
        </span>
      )}
    </div>
  );
};
