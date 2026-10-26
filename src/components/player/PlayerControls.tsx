import React from 'react';
import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Repeat1, Loader2 } from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';
import { KeycapButton } from '../common/KeycapButton';

export const PlayerControls: React.FC = () => {
  const {
    isPlaying,
    isLoading,
    togglePlay,
    nextTrack,
    previousTrack,
    isShuffle,
    toggleShuffle,
    repeatMode,
    toggleRepeat,
    currentTrack,
    queue,
  } = usePlayer();

  const isQueueEmpty = queue.length === 0 && !currentTrack;

  return (
    <div className="flex items-center gap-3 sm:gap-4">
      {/* Shuffle Keycap with Mechanical LED Pip */}
      <KeycapButton
        variant="deck"
        shape="square"
        size="sm"
        disabled={isQueueEmpty}
        onClick={toggleShuffle}
        active={isShuffle}
        hasLed
        ledActive={isShuffle}
        tooltip={isShuffle ? 'Disable Shuffle' : 'Enable Shuffle'}
        aria-label={isShuffle ? 'Disable shuffle' : 'Enable shuffle'}
        icon={<Shuffle className="w-3.5 h-3.5" />}
      />

      {/* Previous Track Transport Keycap */}
      <KeycapButton
        variant="deck"
        shape="circle"
        size="md"
        disabled={isQueueEmpty}
        onClick={previousTrack}
        tooltip="Previous Track"
        aria-label="Previous track"
        icon={<SkipBack className="w-4 h-4 fill-current" />}
      />

      {/* Master Play/Pause Keycap — Primary Vermilion Raised Bevel Keycap */}
      <KeycapButton
        variant="primary"
        shape="circle"
        size="lg"
        disabled={isQueueEmpty}
        onClick={togglePlay}
        tooltip={isPlaying ? 'Pause' : 'Play'}
        aria-label={isPlaying ? 'Pause' : 'Play'}
        className="w-12 h-12 shadow-xl border-2 border-cinema-gold/40"
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin text-white" />
        ) : isPlaying ? (
          <Pause className="w-5 h-5 fill-current text-white" />
        ) : (
          <Play className="w-5 h-5 fill-current ml-0.5 text-white" />
        )}
      </KeycapButton>

      {/* Next Track Transport Keycap */}
      <KeycapButton
        variant="deck"
        shape="circle"
        size="md"
        disabled={isQueueEmpty}
        onClick={nextTrack}
        tooltip="Next Track"
        aria-label="Next track"
        icon={<SkipForward className="w-4 h-4 fill-current" />}
      />

      {/* Repeat Mode Keycap with Mechanical LED Pip */}
      <KeycapButton
        variant="deck"
        shape="square"
        size="sm"
        disabled={isQueueEmpty}
        onClick={toggleRepeat}
        active={repeatMode !== 'off'}
        hasLed
        ledActive={repeatMode !== 'off'}
        tooltip={`Repeat: ${repeatMode}`}
        aria-label={`Repeat mode: ${repeatMode}`}
        icon={
          repeatMode === 'one' ? (
            <Repeat1 className="w-3.5 h-3.5" />
          ) : (
            <Repeat className="w-3.5 h-3.5" />
          )
        }
      />
    </div>
  );
};
