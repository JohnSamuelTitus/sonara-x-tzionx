import React from 'react';
import { Heart, Film } from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';
import { KeycapButton } from '../common/KeycapButton';

export const TrackInfo: React.FC = () => {
  const { currentTrack, isLiked, toggleLike } = usePlayer();

  if (!currentTrack) {
    return (
      <div className="flex items-center gap-3 w-64 min-w-[180px]">
        <div className="w-12 h-12 rounded-lg bg-cinema-card flex items-center justify-center text-cinema-ivoryMuted/50 border border-cinema-border/50 shadow-inner">
          <Film className="w-5 h-5 text-cinema-gold/40" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-cinema-ivoryMuted">No track loaded</p>
          <p className="text-[10px] text-cinema-ivoryMuted/60 font-mono">Select a TFI track</p>
        </div>
      </div>
    );
  }

  const liked = isLiked(currentTrack.id);

  return (
    <div className="flex items-center gap-3 w-64 min-w-[180px]">
      <div className="relative group/art flex-shrink-0">
        <img
          src={currentTrack.coverUrl}
          alt={currentTrack.title}
          className="w-12 h-12 rounded-lg object-cover bg-cinema-card shadow-md border border-cinema-gold/30"
        />
        <div className="absolute inset-0 rounded-lg ring-1 ring-inset ring-white/10 pointer-events-none" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-xs sm:text-sm font-bold text-cinema-ivory truncate hover:text-cinema-gold cursor-pointer transition-colors font-sans leading-tight">
          {currentTrack.title}
        </p>
        <p className="text-xs text-cinema-ivoryMuted truncate hover:underline cursor-pointer mt-0.5">
          {currentTrack.artist}
        </p>
        <p className="text-[10px] text-cinema-gold/80 truncate font-mono mt-0.5">
          {currentTrack.genre || 'TFI Master'}
        </p>
      </div>

      <KeycapButton
        variant="deck"
        shape="circle"
        size="xs"
        onClick={() => toggleLike(currentTrack.id, currentTrack)}
        aria-label={liked ? `Unlike ${currentTrack.title}` : `Like ${currentTrack.title}`}
        tooltip={liked ? 'Unlike' : 'Like'}
        className="flex-shrink-0"
        icon={
          <Heart
            className={`w-3.5 h-3.5 ${
              liked ? 'fill-cinema-vermilion text-cinema-vermilion' : 'text-cinema-ivoryMuted'
            }`}
          />
        }
      />
    </div>
  );
};
