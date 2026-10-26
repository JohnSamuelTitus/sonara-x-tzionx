import React from 'react';
import { TrackInfo } from './TrackInfo';
import { PlayerControls } from './PlayerControls';
import { ProgressBar } from './ProgressBar';
import { VolumeControl } from './VolumeControl';
import { usePlayer } from '../../context/PlayerContext';
import { AlertCircle, RotateCcw, X } from 'lucide-react';
import { KeycapButton } from '../common/KeycapButton';

export const PlayerBar: React.FC = () => {
  const { error, clearError, retryPlay, currentTrack } = usePlayer();

  return (
    <>
      {/* Understandable Error Notice Banner for both mobile and desktop */}
      {error && (
        <div
          role="alert"
          aria-live="assertive"
          className="relative z-40 flex items-center justify-between px-3 sm:px-4 py-2 bg-cinema-wine/95 border-t border-b border-cinema-vermilion/50 text-cinema-ivory text-xs shadow-md transition-all animate-in slide-in-from-bottom-2 duration-200"
        >
          <div className="flex items-center gap-2.5 min-w-0 mr-3">
            <AlertCircle className="w-4 h-4 text-cinema-vermilion flex-shrink-0 animate-pulse" />
            <div className="min-w-0 font-sans">
              <span className="font-bold text-cinema-gold mr-2 font-mono uppercase tracking-wider text-[11px]">Notice:</span>
              <span className="truncate">{error}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {currentTrack && (
              <KeycapButton
                variant="primary"
                shape="square"
                size="xs"
                onClick={() => retryPlay()}
                aria-label="Retry playback"
                icon={<RotateCcw className="w-3 h-3" />}
              >
                Retry
              </KeycapButton>
            )}
            <button
              type="button"
              onClick={clearError}
              aria-label="Dismiss error"
              className="p-1 rounded text-cinema-ivoryMuted hover:text-white transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Desktop Persistent Bottom Playback Bar (>= 768px) */}
      <footer className="hidden md:flex relative flex-col bg-cinema-surface border-t-2 border-cinema-border/70 z-40 select-none shadow-[0_-8px_25px_rgba(0,0,0,0.8)]">
        <div className="flex items-center justify-between h-20 px-4 md:px-6">
          {/* Left: Current Track Details */}
          <TrackInfo />

          {/* Center: Controls & Scrubber */}
          <div className="flex flex-col items-center justify-center flex-1 max-w-2xl px-4">
            <PlayerControls />
            <div className="w-full mt-1.5">
              <ProgressBar />
            </div>
          </div>

          {/* Right: Volume & Queue Tools */}
          <div className="flex items-center">
            <VolumeControl />
          </div>
        </div>
      </footer>
    </>
  );
};
