import React, { useState } from 'react';
import { usePlayer } from '../../context/PlayerContext';
import { X, Film, Maximize2, Minimize2 } from 'lucide-react';

export const YouTubePlayerSurface: React.FC = () => {
  const {
    currentTrack,
    isYouTubeActive,
    isYouTubeVideoVisible,
    setIsYouTubeVideoVisible,
  } = usePlayer();

  const [isExpanded, setIsExpanded] = useState(false);

  const isYouTubeTrack =
    isYouTubeActive || Boolean(currentTrack?.videoId) || Boolean(currentTrack?.id.startsWith('yt-'));
  const isShown = isYouTubeTrack && isYouTubeVideoVisible;

  return (
    <div
      aria-label="Cinema Screening Monitor"
      className={`fixed transition-all duration-300 z-50 rounded-xl overflow-hidden shadow-2xl bg-black border border-cinema-gold/40 ring-1 ring-white/10 group ${
        isShown
          ? isExpanded
            ? 'bottom-20 md:bottom-24 right-3 md:right-5 w-[280px] sm:w-[320px] md:w-[360px] aspect-video opacity-100 pointer-events-auto scale-100 shadow-[0_12px_40px_rgba(0,0,0,0.8)]'
            : 'bottom-20 md:bottom-24 right-3 md:right-5 w-[180px] sm:w-[200px] md:w-[220px] aspect-video opacity-100 pointer-events-auto scale-100 shadow-[0_8px_30px_rgba(0,0,0,0.7)]'
          : '-bottom-[9999px] -right-[9999px] w-[200px] h-[112px] opacity-0 pointer-events-none'
      }`}
    >
      {/* Floating Hover Controls Overlay (Appears smoothly on hover) */}
      {isShown && (
        <div className="absolute top-0 inset-x-0 p-1.5 bg-gradient-to-b from-black/85 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 flex items-center justify-between pointer-events-auto">
          {/* Left Mini Cinema Badge */}
          <div className="flex items-center gap-1.5 px-1.5 py-0.5 rounded bg-black/70 border border-cinema-gold/30 text-[9px] font-mono font-bold text-cinema-gold uppercase tracking-wider backdrop-blur-sm shadow">
            <Film className="w-2.5 h-2.5 text-cinema-gold flex-shrink-0" />
            <span className="truncate max-w-[100px] sm:max-w-[130px] font-sans text-cinema-ivory text-[10px] normal-case font-medium">
              {currentTrack?.title || 'Cinema'}
            </span>
          </div>

          {/* Right Action Keycaps */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded((prev) => !prev);
              }}
              className="p-1 rounded-full bg-black/70 hover:bg-cinema-panel text-cinema-ivoryMuted hover:text-cinema-gold transition-colors shadow"
              title={isExpanded ? 'Compact mode' : 'Expand size'}
              aria-label={isExpanded ? 'Compact mode' : 'Expand size'}
            >
              {isExpanded ? (
                <Minimize2 className="w-3 h-3" />
              ) : (
                <Maximize2 className="w-3 h-3" />
              )}
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsYouTubeVideoVisible(false);
              }}
              className="p-1 rounded-full bg-black/70 hover:bg-cinema-panel text-cinema-ivoryMuted hover:text-cinema-vermilion transition-colors shadow"
              title="Close screen (audio keeps playing)"
              aria-label="Close screen"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* Embedded IFrame Target Container - Edge-to-edge 16:9 Fit */}
      <div className="w-full h-full bg-black overflow-hidden relative">
        <div id="sonora-youtube-player-iframe" className="w-full h-full" />
      </div>
    </div>
  );
};

