import React, { useState } from 'react';
import { formatTime } from '../../utils/formatters';
import { usePlayer } from '../../context/PlayerContext';

export const ProgressBar: React.FC = () => {
  const { currentTime, duration, seek, currentTrack } = usePlayer();
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [scrubValue, setScrubValue] = useState(0);

  const displayTime = isScrubbing ? scrubValue : currentTime;
  const progressPercent = duration > 0 ? (displayTime / duration) * 100 : 0;

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setScrubValue(val);
  };

  const handleSeekCommit = () => {
    if (isScrubbing) {
      seek(scrubValue);
      setIsScrubbing(false);
    }
  };

  return (
    <div className="flex items-center gap-3 w-full max-w-xl text-xs font-mono">
      {/* Elapsed Tape Counter Display */}
      <span className="tape-counter text-[11px] min-w-[48px] text-center">
        {formatTime(displayTime)}
      </span>

      {/* Progress Scrubber */}
      <div className="relative flex-1 group flex items-center py-1">
        <input
          type="range"
          min="0"
          max={duration || 100}
          step="0.1"
          disabled={!currentTrack || duration <= 0}
          value={displayTime}
          onChange={handleSliderChange}
          onMouseDown={() => {
            setIsScrubbing(true);
            setScrubValue(currentTime);
          }}
          onMouseUp={handleSeekCommit}
          onTouchStart={() => {
            setIsScrubbing(true);
            setScrubValue(currentTime);
          }}
          onTouchEnd={handleSeekCommit}
          aria-label="Seek position in track"
          className="deck-slider w-full h-1.5 rounded-lg cursor-pointer focus:outline-none disabled:opacity-40"
          style={{
            background: `linear-gradient(to right, #D9381E 0%, #D4AF37 ${progressPercent}%, #2A1F26 ${progressPercent}%)`,
          }}
        />
      </div>

      {/* Total Duration Tape Counter Display */}
      <span className="tape-counter text-[11px] min-w-[48px] text-center">
        {formatTime(duration)}
      </span>
    </div>
  );
};
