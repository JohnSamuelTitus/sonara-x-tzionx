import React from 'react';
import {
  ChevronDown,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Heart,
  Volume2,
  Volume1,
  VolumeX,
  ListMusic,
  Loader2,
} from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';
import { KeycapButton } from '../common/KeycapButton';
import { ProgressBar } from './ProgressBar';

interface MobileFullPlayerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileFullPlayer: React.FC<MobileFullPlayerProps> = ({ isOpen, onClose }) => {
  const {
    currentTrack,
    isPlaying,
    isLoading,
    togglePlay,
    nextTrack,
    previousTrack,
    isShuffle,
    toggleShuffle,
    repeatMode,
    toggleRepeat,
    isLiked,
    toggleLike,
    volume,
    setVolume,
    isMuted,
    toggleMute,
    isQueueOpen,
    setIsQueueOpen,
  } = usePlayer();

  if (!isOpen || !currentTrack) return null;

  const liked = isLiked(currentTrack.id);
  const effectiveVolume = isMuted ? 0 : volume;
  const VolumeIcon = effectiveVolume === 0 ? VolumeX : effectiveVolume < 0.5 ? Volume1 : Volume2;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Full music player"
      className="md:hidden fixed inset-0 z-50 flex flex-col bg-cinema-bg text-cinema-ivory animate-in slide-in-from-bottom duration-300 overflow-y-auto select-none"
    >
      {/* Blurred Album Art Background Ambient Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
        <img
          src={currentTrack.coverUrl}
          alt=""
          className="w-full h-full object-cover filter blur-3xl scale-125"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-cinema-bg/75 via-cinema-bg/90 to-cinema-bg" />
      </div>

      <div className="relative z-10 flex flex-col justify-between min-h-full p-4 sm:p-6 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        {/* Top Header */}
        <div className="flex items-center justify-between gap-3">
          <KeycapButton
            variant="deck"
            shape="circle"
            size="sm"
            onClick={onClose}
            aria-label="Collapse player"
            className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center"
            icon={<ChevronDown className="w-5 h-5 text-cinema-ivory" />}
          />

          <div className="text-center min-w-0 flex-1 px-2">
            <span className="font-mono text-[9px] sm:text-[10px] font-bold text-cinema-gold uppercase tracking-widest block">
              PLAYING FROM TFI VAULT
            </span>
            <p className="font-sans text-xs text-cinema-ivory font-bold truncate max-w-[200px] sm:max-w-xs mx-auto">
              {currentTrack.album || 'Sonara Cinema Master'}
            </p>
          </div>

          <KeycapButton
            variant={isQueueOpen ? 'primary' : 'deck'}
            shape="circle"
            size="sm"
            onClick={() => setIsQueueOpen(!isQueueOpen)}
            aria-label="Toggle playback queue"
            className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center"
            icon={<ListMusic className="w-4 h-4 text-cinema-ivory" />}
          />
        </div>

        {/* Center: Large Vinyl Artwork (Responsive for short and tall displays) */}
        <div className="my-auto py-3 sm:py-4 flex flex-col items-center">
          <div className="relative group w-48 h-48 sm:w-64 sm:h-64 max-w-[70vw] max-h-[35vh] aspect-square rounded-2xl overflow-hidden shadow-[0_16px_40px_rgba(0,0,0,0.9)] border-2 border-cinema-gold/40">
            <img
              src={currentTrack.coverUrl}
              alt={currentTrack.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 ring-1 ring-inset ring-white/15 rounded-2xl pointer-events-none" />
          </div>

          {/* Track Title & Like Button */}
          <div className="w-full max-w-sm mt-4 sm:mt-6 flex items-center justify-between px-1">
            <div className="min-w-0 flex-1 mr-3">
              <h1 className="font-sans text-base sm:text-lg font-bold text-cinema-ivory truncate">
                {currentTrack.title}
              </h1>
              <p className="font-sans text-xs sm:text-sm text-cinema-ivoryMuted truncate mt-0.5">
                {currentTrack.artist}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2 py-0.5 rounded font-mono text-[9px] font-bold uppercase bg-cinema-panel border border-cinema-border/60 text-cinema-gold">
                  {currentTrack.genre || 'TFI Master'}
                </span>
              </div>
            </div>

            <KeycapButton
              variant="deck"
              shape="circle"
              size="md"
              onClick={() => toggleLike(currentTrack.id, currentTrack)}
              aria-label={liked ? `Unlike ${currentTrack.title}` : `Like ${currentTrack.title}`}
              className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center flex-shrink-0"
              icon={
                <Heart
                  className={`w-5 h-5 ${
                    liked ? 'fill-cinema-vermilion text-cinema-vermilion' : 'text-cinema-ivoryMuted'
                  }`}
                />
              }
            />
          </div>
        </div>

        {/* Scrubber & Controls */}
        <div className="w-full max-w-sm mx-auto space-y-4 sm:space-y-5">
          {/* Progress Bar with elapsed time and duration */}
          <div className="w-full">
            <ProgressBar />
          </div>

          {/* Master Transport Controls */}
          <div className="flex items-center justify-between px-2">
            {/* Shuffle */}
            <KeycapButton
              variant="deck"
              shape="square"
              size="sm"
              onClick={toggleShuffle}
              active={isShuffle}
              hasLed
              ledActive={isShuffle}
              aria-label={isShuffle ? 'Disable shuffle' : 'Enable shuffle'}
              className="w-10 h-10 min-w-[40px] min-h-[40px]"
              icon={<Shuffle className="w-4 h-4" />}
            />

            {/* Previous */}
            <KeycapButton
              variant="deck"
              shape="circle"
              size="md"
              onClick={previousTrack}
              aria-label="Previous track"
              className="w-11 h-11 min-w-[44px] min-h-[44px]"
              icon={<SkipBack className="w-5 h-5 fill-current" />}
            />

            {/* Master Play/Pause Vermilion Keycap */}
            <KeycapButton
              variant="primary"
              shape="circle"
              size="lg"
              onClick={togglePlay}
              aria-label={isPlaying ? 'Pause' : 'Play'}
              className="w-16 h-16 min-w-[64px] min-h-[64px] shadow-2xl border-2 border-cinema-gold/50 flex items-center justify-center"
            >
              {isLoading ? (
                <Loader2 className="w-7 h-7 animate-spin text-white" />
              ) : isPlaying ? (
                <Pause className="w-7 h-7 fill-current text-white" />
              ) : (
                <Play className="w-7 h-7 fill-current ml-1 text-white" />
              )}
            </KeycapButton>

            {/* Next */}
            <KeycapButton
              variant="deck"
              shape="circle"
              size="md"
              onClick={nextTrack}
              aria-label="Next track"
              className="w-11 h-11 min-w-[44px] min-h-[44px]"
              icon={<SkipForward className="w-5 h-5 fill-current" />}
            />

            {/* Repeat */}
            <KeycapButton
              variant="deck"
              shape="square"
              size="sm"
              onClick={toggleRepeat}
              active={repeatMode !== 'off'}
              hasLed
              ledActive={repeatMode !== 'off'}
              aria-label={`Repeat mode: ${repeatMode}`}
              className="w-10 h-10 min-w-[40px] min-h-[40px]"
              icon={
                repeatMode === 'one' ? (
                  <Repeat1 className="w-4 h-4" />
                ) : (
                  <Repeat className="w-4 h-4" />
                )
              }
            />
          </div>

          {/* Volume Control */}
          <div className="flex items-center justify-center gap-2.5 pt-1 px-1 w-full max-w-[240px] mx-auto">
            <KeycapButton
              variant="deck"
              shape="square"
              size="xs"
              onClick={toggleMute}
              aria-label={isMuted ? 'Unmute volume' : 'Mute volume'}
              className="w-9 h-9 min-w-[36px] min-h-[36px]"
              icon={<VolumeIcon className="w-3.5 h-3.5" />}
            />
            <div className="flex-1">
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={effectiveVolume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                aria-label="Volume level"
                className="deck-slider w-full h-1.5 cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #D4AF37 ${effectiveVolume * 100}%, #2A1F26 ${effectiveVolume * 100}%)`,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
