import React from 'react';
import { usePlayer } from '../../context/PlayerContext';
import { X, Film, Maximize2 } from 'lucide-react';
import { KeycapButton } from '../common/KeycapButton';

export const YouTubePlayerSurface: React.FC = () => {
  const {
    currentTrack,
    isYouTubeActive,
    isYouTubeVideoVisible,
    setIsYouTubeVideoVisible,
  } = usePlayer();

  const isYouTubeTrack = isYouTubeActive || Boolean(currentTrack?.videoId) || currentTrack?.id.startsWith('yt-');

  return (
    <div
      aria-label="Cinema Screening Monitor"
      className={`fixed transition-all duration-300 z-50 bg-cinema-card border-2 border-cinema-border rounded-xl overflow-hidden shadow-2xl flex flex-col ${
        !isYouTubeTrack
          ? 'bottom-0 right-0 w-1 h-1 opacity-0 pointer-events-none'
          : isYouTubeVideoVisible
          ? 'bottom-24 sm:bottom-24 right-3 md:right-6 left-3 sm:left-auto w-auto sm:w-80 md:w-96 h-52 sm:h-56 md:h-64 opacity-100 pointer-events-auto scale-100'
          : 'bottom-24 sm:bottom-24 right-3 w-36 sm:w-44 h-24 sm:h-28 opacity-90 hover:opacity-100 border-cinema-gold/70 pointer-events-auto scale-100 cursor-pointer group'
      }`}
      onClick={() => {
        if (!isYouTubeVideoVisible && isYouTubeTrack) {
          setIsYouTubeVideoVisible(true);
        }
      }}
    >
      {/* Header Bar of Floating Cinema Monitor (Visible in expanded mode) */}
      {isYouTubeVideoVisible && (
        <div className="flex items-center justify-between px-3 py-1.5 bg-cinema-surface border-b border-cinema-border/60 text-xs">
          <div className="flex items-center gap-2 text-cinema-ivory truncate mr-2">
            <Film className="w-3.5 h-3.5 text-cinema-gold flex-shrink-0" />
            <span className="font-mono text-[10px] text-cinema-gold uppercase tracking-wider font-bold">
              CINEMA MONITOR
            </span>
            <span className="truncate text-cinema-ivoryMuted text-[11px] font-sans">
              · {currentTrack?.title}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <KeycapButton
              variant="deck"
              shape="circle"
              size="xs"
              onClick={(e) => {
                e.stopPropagation();
                setIsYouTubeVideoVisible(false);
              }}
              aria-label="Minimize cinema monitor"
              tooltip="Minimize"
              icon={<X className="w-3 h-3 text-cinema-ivoryMuted" />}
            />
          </div>
        </div>
      )}

      {/* Embedded IFrame Target Container */}
      <div className="relative flex-1 bg-black overflow-hidden flex items-center justify-center">
        <div id="sonora-youtube-player-iframe" className="w-full h-full" />

        {/* Minimized Overlay hint */}
        {!isYouTubeVideoVisible && isYouTubeTrack && (
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
            <div className="flex items-center gap-1 px-2 py-1 rounded bg-black/80 text-[10px] font-mono text-cinema-gold uppercase font-bold">
              <Maximize2 className="w-3 h-3" />
              <span>Expand</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

