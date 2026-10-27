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
      className={`fixed transition-all duration-300 ease-out z-50 rounded-xl overflow-hidden bg-black border border-cinema-gold/50 ring-1 ring-white/10 group bottom-[calc(110px+max(0.5rem,env(safe-area-inset-bottom)))] md:bottom-24 right-3 md:right-5 ${
        isExpanded
          ? 'w-[300px] sm:w-[360px] md:w-[420px] max-w-[calc(100vw-24px)] aspect-video'
          : 'w-[200px] sm:w-[240px] md:w-[260px] aspect-video'
      } ${
        isShown
          ? 'opacity-100 pointer-events-auto scale-100 translate-y-0 shadow-[0_16px_50px_rgba(0,0,0,0.85)]'
          : 'opacity-0 pointer-events-none scale-90 translate-y-6 shadow-none'
      }`}
    >
      {/* Floating Hover Controls Overlay (Appears smoothly on hover) */}
      <div
        className={`absolute top-0 inset-x-0 p-2 bg-gradient-to-b from-black/90 via-black/50 to-transparent transition-opacity duration-200 z-10 flex items-center justify-between ${
          isShown ? 'opacity-0 group-hover:opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Left Mini Cinema Badge */}
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-black/80 border border-cinema-gold/40 text-[9px] font-mono font-bold text-cinema-gold uppercase tracking-wider backdrop-blur-md shadow">
          <Film className="w-2.5 h-2.5 text-cinema-gold flex-shrink-0 animate-pulse" />
          <span className="truncate max-w-[110px] sm:max-w-[150px] font-sans text-cinema-ivory text-[10px] normal-case font-medium">
            {currentTrack?.title || 'Cinema Screen'}
          </span>
        </div>

        {/* Right Action Keycaps */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded((prev) => !prev);
            }}
            className="p-1.5 rounded-full bg-black/80 hover:bg-cinema-panel text-cinema-ivoryMuted hover:text-cinema-gold transition-colors shadow border border-white/10"
            title={isExpanded ? 'Compact mode' : 'Enlarge screen'}
            aria-label={isExpanded ? 'Compact mode' : 'Enlarge screen'}
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
            className="p-1.5 rounded-full bg-black/80 hover:bg-cinema-panel text-cinema-ivoryMuted hover:text-cinema-vermilion transition-colors shadow border border-white/10"
            title="Minimize to background (audio continues playing)"
            aria-label="Minimize video to background"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Embedded IFrame Target Container - Edge-to-edge 16:9 Fit */}
      <div className="w-full h-full bg-black overflow-hidden relative">
        <div id="sonora-youtube-player-iframe" className="w-full h-full" />
      </div>
    </div>
  );
};

