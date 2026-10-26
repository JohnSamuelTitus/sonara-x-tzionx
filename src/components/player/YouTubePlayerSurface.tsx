import React from 'react';
import { usePlayer } from '../../context/PlayerContext';
import { X, Film } from 'lucide-react';
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
        isYouTubeVideoVisible && isYouTubeTrack
          ? 'bottom-32 md:bottom-24 right-3 md:right-6 left-3 sm:left-auto w-auto sm:w-80 md:w-96 h-48 sm:h-56 md:h-64 opacity-100 pointer-events-auto scale-100'
          : 'bottom-32 md:bottom-24 right-6 w-1 h-1 opacity-0 pointer-events-none scale-90'
      }`}
    >
      {/* Header Bar of Floating Cinema Monitor */}
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
            onClick={() => setIsYouTubeVideoVisible(false)}
            aria-label="Minimize cinema monitor"
            tooltip="Minimize"
            icon={<X className="w-3 h-3 text-cinema-ivoryMuted" />}
          />
        </div>
      </div>

      {/* Embedded IFrame Target Container */}
      <div className="relative flex-1 bg-black overflow-hidden flex items-center justify-center">
        <div id="sonora-youtube-player-iframe" className="w-full h-full" />
      </div>
    </div>
  );
};
