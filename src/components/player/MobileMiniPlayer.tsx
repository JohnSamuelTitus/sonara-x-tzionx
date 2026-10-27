import React, { useState } from 'react';
import { Play, Pause, Heart, Loader2 } from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';
import { KeycapButton } from '../common/KeycapButton';
import { MobileFullPlayer } from './MobileFullPlayer';

export const MobileMiniPlayer: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    isLoading,
    togglePlay,
    isLiked,
    toggleLike,
    currentTime,
    duration,
  } = usePlayer();

  const [isFullPlayerOpen, setIsFullPlayerOpen] = useState(false);

  // Display only when a track is active per Phase 2.D specifications
  if (!currentTrack) {
    return null;
  }

  const liked = isLiked(currentTrack.id);
  const progressPercent = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  return (
    <>
      <div
        role="region"
        aria-label="Now playing mini player"
        className="md:hidden fixed bottom-[calc(56px+max(0.5rem,env(safe-area-inset-bottom)))] left-0 right-0 z-30 bg-cinema-surface/95 border-t border-cinema-gold/30 backdrop-blur-md px-3.5 py-2 flex flex-col shadow-[0_-4px_18px_rgba(0,0,0,0.85)] select-none transition-all duration-200 animate-in slide-in-from-bottom-2"
        onClick={() => setIsFullPlayerOpen(true)}
      >
        {/* Top Mini Scrubber Bar Indicator */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-cinema-card overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cinema-vermilion via-cinema-gold to-cinema-gold transition-all duration-200"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="flex items-center justify-between gap-3 pt-0.5">
          {/* Left: Track Cover & Metadata (Touch target expands full player) */}
          <div className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer">
            <img
              src={currentTrack.coverUrl}
              alt={currentTrack.title}
              className="w-10 h-10 rounded-lg object-cover flex-shrink-0 border border-cinema-gold/35 shadow-sm"
              loading="lazy"
            />

            <div className="min-w-0 flex-1 pr-1">
              <p className="font-sans font-bold text-xs text-cinema-ivory truncate">
                {currentTrack.title}
              </p>
              <p className="font-sans text-[11px] text-cinema-ivoryMuted truncate mt-0.5">
                {currentTrack.artist}
              </p>
            </div>
          </div>

          {/* Right Action Keycaps with accessible 44px touch targets */}
          <div
            className="flex items-center gap-2 flex-shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <KeycapButton
              variant="deck"
              shape="circle"
              size="sm"
              onClick={() => toggleLike(currentTrack.id, currentTrack)}
              aria-label={liked ? `Unlike ${currentTrack.title}` : `Like ${currentTrack.title}`}
              className="w-10 h-10 min-w-[40px] min-h-[40px]"
              icon={
                <Heart
                  className={`w-4 h-4 ${
                    liked ? 'fill-cinema-vermilion text-cinema-vermilion' : 'text-cinema-ivoryMuted'
                  }`}
                />
              }
            />

            <KeycapButton
              variant="primary"
              shape="circle"
              size="md"
              onClick={togglePlay}
              aria-label={isPlaying ? 'Pause playback' : 'Start playback'}
              className="w-11 h-11 min-w-[44px] min-h-[44px] shadow-lg border border-cinema-gold/40 flex items-center justify-center"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              ) : isPlaying ? (
                <Pause className="w-4 h-4 fill-current text-white" />
              ) : (
                <Play className="w-4 h-4 fill-current ml-0.5 text-white" />
              )}
            </KeycapButton>
          </div>
        </div>
      </div>

      {/* Full-Screen Mobile Player Overlay */}
      <MobileFullPlayer
        isOpen={isFullPlayerOpen}
        onClose={() => setIsFullPlayerOpen(false)}
      />
    </>
  );
};
