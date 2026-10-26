import React, { useState } from 'react';
import { Play, Pause, Heart, Loader2, Film } from 'lucide-react';
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

  const liked = currentTrack ? isLiked(currentTrack.id) : false;
  const progressPercent = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  return (
    <>
      <div
        className="md:hidden fixed bottom-[58px] left-0 right-0 z-30 bg-cinema-surface/95 border-t border-cinema-gold/30 backdrop-blur-md px-3 py-2 flex flex-col shadow-[0_-4px_16px_rgba(0,0,0,0.8)] select-none"
        onClick={() => {
          if (currentTrack) {
            setIsFullPlayerOpen(true);
          }
        }}
      >
        {/* Top Mini Scrubber Bar Indicator */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-cinema-card">
          <div
            className="h-full bg-gradient-to-r from-cinema-vermilion to-cinema-gold transition-all duration-200"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="flex items-center justify-between gap-3 pt-0.5">
          {/* Left: Track Cover & Metadata */}
          <div className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer">
            {currentTrack ? (
              <img
                src={currentTrack.coverUrl}
                alt={currentTrack.title}
                className="w-10 h-10 rounded-lg object-cover flex-shrink-0 border border-cinema-gold/30 shadow-sm"
              />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-cinema-card flex items-center justify-center border border-cinema-border/50 text-cinema-gold flex-shrink-0">
                <Film className="w-4 h-4" />
              </div>
            )}

            <div className="min-w-0 flex-1">
              <p className="font-sans font-bold text-xs text-cinema-ivory truncate">
                {currentTrack ? currentTrack.title : 'Sonara Cinema Player'}
              </p>
              <p className="font-sans text-[11px] text-cinema-ivoryMuted truncate">
                {currentTrack ? currentTrack.artist : 'Tap to select a track'}
              </p>
            </div>
          </div>

          {/* Right Action Keycaps */}
          {currentTrack && (
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
                aria-label={isPlaying ? 'Pause' : 'Play'}
                className="w-10 h-10 shadow-lg border border-cinema-gold/40"
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
          )}
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
