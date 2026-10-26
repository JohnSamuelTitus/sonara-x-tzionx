import React from 'react';
import { X, Music2, Heart, Disc3 } from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';
import { KeycapButton } from '../common/KeycapButton';
import { formatTime } from '../../utils/formatters';

export const QueueDrawer: React.FC = () => {
  const { isQueueOpen, setIsQueueOpen, queue, queueIndex, currentTrack, playTrack, isLiked, toggleLike } = usePlayer();

  if (!isQueueOpen) return null;

  const upcomingTracks = queue.slice(queueIndex + 1);

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-96 max-w-full bg-cinema-surface border-l-2 border-cinema-border/70 shadow-2xl z-50 flex flex-col p-4 sm:p-5 animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-cinema-border/50">
        <div className="flex items-center gap-2">
          <Disc3 className="w-4 h-4 text-cinema-gold animate-spin-slow" />
          <h2 className="font-display text-lg tracking-wider uppercase text-cinema-ivory">
            Stereo Tape Queue
          </h2>
        </div>
        <KeycapButton
          variant="deck"
          shape="circle"
          size="xs"
          onClick={() => setIsQueueOpen(false)}
          aria-label="Close queue"
          tooltip="Close"
          icon={<X className="w-3.5 h-3.5 text-cinema-ivory" />}
        />
      </div>

      <div className="flex-1 overflow-y-auto space-y-6 pt-4 pr-1">
        {/* Now Playing Section */}
        <section>
          <h3 className="text-[10px] font-mono font-bold text-cinema-gold uppercase tracking-widest mb-2">
            Active Tape Head
          </h3>
          {currentTrack ? (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-cinema-panel border-2 border-cinema-gold/40 shadow-inner">
              <img
                src={currentTrack.coverUrl}
                alt={currentTrack.title}
                className="w-12 h-12 rounded-lg object-cover flex-shrink-0 border border-cinema-border/60"
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-bold text-cinema-gold truncate font-sans">
                  {currentTrack.title}
                </p>
                <p className="text-xs text-cinema-ivoryMuted truncate font-sans mt-0.5">
                  {currentTrack.artist}
                </p>
              </div>
              <KeycapButton
                variant="deck"
                shape="circle"
                size="xs"
                onClick={() => toggleLike(currentTrack.id, currentTrack)}
                aria-label={isLiked(currentTrack.id) ? `Unlike ${currentTrack.title}` : `Like ${currentTrack.title}`}
                icon={
                  <Heart
                    className={`w-3.5 h-3.5 ${
                      isLiked(currentTrack.id)
                        ? 'fill-cinema-vermilion text-cinema-vermilion'
                        : 'text-cinema-ivoryMuted'
                    }`}
                  />
                }
              />
              <span className="tape-counter text-[10px]">{formatTime(currentTrack.duration)}</span>
            </div>
          ) : (
            <p className="text-xs text-cinema-ivoryMuted italic font-sans">No track playing</p>
          )}
        </section>

        {/* Up Next Section */}
        <section>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[10px] font-mono font-bold text-cinema-gold uppercase tracking-widest">
              Upcoming Reel ({upcomingTracks.length})
            </h3>
          </div>

          {upcomingTracks.length === 0 ? (
            <div className="text-center py-8 text-cinema-ivoryMuted">
              <Music2 className="w-8 h-8 opacity-30 mx-auto mb-1.5" />
              <p className="text-xs font-sans">End of tape queue</p>
            </div>
          ) : (
            <div className="space-y-1">
              {upcomingTracks.map((track, i) => {
                const liked = isLiked(track.id);
                return (
                  <div
                    key={`${track.id}-${i}`}
                    onClick={() => playTrack(track, queue)}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-cinema-panel cursor-pointer transition-colors text-xs text-cinema-ivory group border border-transparent hover:border-cinema-border/40"
                  >
                    <img
                      src={track.coverUrl}
                      alt={track.title}
                      className="w-9 h-9 rounded object-cover flex-shrink-0 border border-cinema-border/40"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-bold truncate group-hover:text-cinema-gold transition-colors font-sans">
                        {track.title}
                      </p>
                      <p className="text-[11px] text-cinema-ivoryMuted truncate font-sans">{track.artist}</p>
                    </div>
                    <KeycapButton
                      variant="deck"
                      shape="circle"
                      size="xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLike(track.id, track);
                      }}
                      aria-label={liked ? `Unlike ${track.title}` : `Like ${track.title}`}
                      className="opacity-0 group-hover:opacity-100"
                      icon={
                        <Heart
                          className={`w-3 h-3 ${
                            liked ? 'fill-cinema-vermilion text-cinema-vermilion' : 'text-cinema-ivoryMuted'
                          }`}
                        />
                      }
                    />
                    <span className="text-cinema-gold/80 font-mono text-[10px]">
                      {formatTime(track.duration)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
