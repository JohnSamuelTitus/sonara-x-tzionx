import React from 'react';
import { Volume2, Volume1, VolumeX, ListMusic, Tv } from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';
import { KeycapButton } from '../common/KeycapButton';

export const VolumeControl: React.FC = () => {
  const {
    volume,
    setVolume,
    isMuted,
    toggleMute,
    isQueueOpen,
    setIsQueueOpen,
    currentTrack,
    isYouTubeActive,
    isYouTubeVideoVisible,
    setIsYouTubeVideoVisible,
  } = usePlayer();

  const effectiveVolume = isMuted ? 0 : volume;
  const VolumeIcon = effectiveVolume === 0 ? VolumeX : effectiveVolume < 0.5 ? Volume1 : Volume2;
  const isYouTubeTrack = isYouTubeActive || Boolean(currentTrack?.videoId) || currentTrack?.id.startsWith('yt-');

  return (
    <div className="flex items-center gap-2.5 w-64 justify-end">
      {/* Video Screen Toggle Keycap */}
      {isYouTubeTrack && (
        <KeycapButton
          variant={isYouTubeVideoVisible ? 'primary' : 'deck'}
          shape="square"
          size="xs"
          onClick={() => setIsYouTubeVideoVisible(!isYouTubeVideoVisible)}
          aria-label={isYouTubeVideoVisible ? 'Hide cinema screen' : 'Show cinema screen'}
          tooltip="Cinema Screen"
          icon={<Tv className="w-3.5 h-3.5" />}
        />
      )}

      {/* Up Next Queue Keycap */}
      <KeycapButton
        variant={isQueueOpen ? 'gold' : 'deck'}
        shape="square"
        size="xs"
        onClick={() => setIsQueueOpen(!isQueueOpen)}
        aria-label={isQueueOpen ? 'Close queue' : 'Open queue'}
        tooltip="Queue Drawer"
        icon={<ListMusic className="w-3.5 h-3.5" />}
      />

      {/* Mute Keycap */}
      <KeycapButton
        variant="deck"
        shape="square"
        size="xs"
        onClick={toggleMute}
        aria-label={isMuted ? 'Unmute' : 'Mute'}
        tooltip={isMuted ? 'Unmute' : 'Mute'}
        icon={<VolumeIcon className="w-3.5 h-3.5" />}
      />

      {/* Mixer Fader Volume Slider */}
      <div className="w-24 flex items-center">
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={effectiveVolume}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          aria-label="Volume level"
          className="deck-slider w-full h-1.5 cursor-pointer focus:outline-none"
          style={{
            background: `linear-gradient(to right, #D4AF37 ${effectiveVolume * 100}%, #2A1F26 ${effectiveVolume * 100}%)`,
          }}
        />
      </div>
    </div>
  );
};
