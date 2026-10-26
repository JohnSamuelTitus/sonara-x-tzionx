import React from 'react';
import { Play, Pause, Heart, Plus } from 'lucide-react';

interface CardProps {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  badge?: string;
  isPlaying?: boolean;
  isLiked?: boolean;
  onLikeClick?: (e: React.MouseEvent) => void;
  onAddToPlaylistClick?: (e: React.MouseEvent) => void;
  onPlayClick?: (e: React.MouseEvent) => void;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  imageUrl,
  badge,
  isPlaying = false,
  isLiked = false,
  onLikeClick,
  onAddToPlaylistClick,
  onPlayClick,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
      className="group relative flex flex-col p-3 rounded-xl cinema-card cursor-pointer shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 select-none"
    >
      {/* Artwork Container with Cinema Vignette */}
      <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-cinema-card mb-3 shadow-md border border-cinema-border/50">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Gradient shadow overlay for text contrast & film feel */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

        {/* Vintage Cinema Ticket Badge */}
        {badge && (
          <span className="absolute top-2 left-2 text-[9px] font-mono font-bold tracking-widest uppercase px-2 py-0.5 rounded bg-black/80 backdrop-blur-md text-cinema-gold border border-cinema-gold/40 shadow-sm">
            {badge}
          </span>
        )}

        {/* Quick Action Keycaps on Artwork */}
        <div className="absolute top-2 right-2 flex items-center gap-1.5 z-10">
          {onLikeClick && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onLikeClick(e);
              }}
              aria-label={isLiked ? `Unlike ${title}` : `Like ${title}`}
              className={`keycap-base keycap-circle w-7 h-7 flex items-center justify-center transition-all ${
                isLiked
                  ? 'keycap-primary text-white opacity-100'
                  : 'keycap-deck text-cinema-ivoryMuted opacity-0 group-hover:opacity-100 hover:text-white'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} />
            </button>
          )}

          {onAddToPlaylistClick && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onAddToPlaylistClick(e);
              }}
              aria-label={`Add ${title} to playlist`}
              className="keycap-base keycap-circle w-7 h-7 keycap-deck text-cinema-ivoryMuted hover:text-cinema-gold flex items-center justify-center opacity-80 sm:opacity-0 group-hover:opacity-100 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Master Floating Play Action Keycap */}
        {onPlayClick && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPlayClick(e);
            }}
            aria-label={isPlaying ? `Pause ${title}` : `Play ${title}`}
            className={`keycap-base keycap-circle absolute bottom-3 right-3 w-10 h-10 ${
              isPlaying ? 'keycap-gold text-black' : 'keycap-primary text-white'
            } flex items-center justify-center shadow-xl transition-all duration-200 transform ${
              isPlaying
                ? 'opacity-100 scale-100 translate-y-0'
                : 'opacity-90 sm:opacity-0 sm:scale-90 sm:translate-y-2 group-hover:opacity-100 group-hover:scale-100 group-hover:translate-y-0'
            }`}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-current" />
            ) : (
              <Play className="w-4 h-4 fill-current ml-0.5" />
            )}
          </button>
        )}
      </div>

      {/* Metadata */}
      <h3 className="font-sans font-bold text-xs sm:text-sm text-cinema-ivory truncate group-hover:text-cinema-gold transition-colors">
        {title}
      </h3>
      <p className="text-[11px] text-cinema-ivoryMuted truncate mt-0.5 leading-relaxed font-sans">
        {subtitle}
      </p>
    </div>
  );
};
