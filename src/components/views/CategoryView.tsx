import React, { useEffect, useState, useMemo } from 'react';
import { usePlayer } from '../../context/PlayerContext';
import { fetchCategoryTracks } from '../../audio/youtubeApiClient';
import { CATEGORY_DEFINITIONS } from '../../audio/categoryConstants';
import { TrackRow } from '../common/TrackRow';
import { KeycapButton } from '../common/KeycapButton';
import { Play, Pause, Shuffle, ArrowLeft, Search, RotateCcw, AlertTriangle, Film } from 'lucide-react';
import type { Track } from '../../types/music';

export const CategoryView: React.FC = () => {
  const {
    selectedCategoryId,
    setActiveView,
    playTrack,
    togglePlay,
    currentTrack,
    isPlaying,
  } = usePlayer();

  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterQuery, setFilterQuery] = useState('');

  const categoryDef = useMemo(() => {
    return (CATEGORY_DEFINITIONS as any[]).find((c: any) => c.id === selectedCategoryId) || {
      id: selectedCategoryId || 'category',
      title: 'TFI Music Discoveries',
      subtitle: 'Curated cinema stream',
    };
  }, [selectedCategoryId]);

  const loadTracks = async () => {
    if (!selectedCategoryId) return;
    setIsLoading(true);
    setError(null);

    const res = await fetchCategoryTracks(selectedCategoryId, 25);
    setIsLoading(false);

    if (res.error) {
      setError(res.error);
    } else {
      setTracks(res.tracks || []);
    }
  };

  useEffect(() => {
    loadTracks();
  }, [selectedCategoryId]);

  const filteredTracks = useMemo(() => {
    if (!filterQuery.trim()) return tracks;
    const q = filterQuery.toLowerCase();
    return tracks.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.artist.toLowerCase().includes(q) ||
        Boolean(t.genre?.toLowerCase().includes(q))
    );
  }, [tracks, filterQuery]);

  const isPlayingThisCategory =
    isPlaying && currentTrack && tracks.some((t) => t.id === currentTrack.id);

  const handlePlayAll = () => {
    if (filteredTracks.length === 0) return;
    if (isPlayingThisCategory) {
      togglePlay();
    } else {
      playTrack(filteredTracks[0], filteredTracks);
    }
  };

  const handleShufflePlay = () => {
    if (filteredTracks.length === 0) return;
    const shuffled = [...filteredTracks].sort(() => Math.random() - 0.5);
    playTrack(shuffled[0], shuffled);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Back Button & Category Header */}
      <div className="flex items-center gap-3.5 pt-2">
        <KeycapButton
          variant="deck"
          shape="circle"
          size="md"
          onClick={() => setActiveView('home')}
          aria-label="Back to Home"
          tooltip="Back"
          icon={<ArrowLeft className="w-4 h-4 text-cinema-ivory" />}
        />
        <div>
          <span className="text-[10px] font-mono font-bold tracking-widest text-cinema-gold uppercase">
            Cinema Collection
          </span>
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-cinema-ivory tracking-wider uppercase mt-0.5">
            {categoryDef.title}
          </h1>
          <p className="text-xs text-cinema-ivoryMuted font-sans mt-0.5">{categoryDef.subtitle}</p>
        </div>
      </div>

      {/* Action Controls Keycaps & In-Category Search Filter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-2 border-y border-cinema-border/50">
        <div className="flex items-center gap-3">
          <KeycapButton
            variant="primary"
            shape="circle"
            size="lg"
            onClick={handlePlayAll}
            disabled={filteredTracks.length === 0}
            aria-label={isPlayingThisCategory ? 'Pause category' : 'Play category'}
            tooltip={isPlayingThisCategory ? 'Pause' : 'Play All'}
          >
            {isPlayingThisCategory ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current ml-0.5" />
            )}
          </KeycapButton>

          <KeycapButton
            variant="deck"
            shape="circle"
            size="md"
            onClick={handleShufflePlay}
            disabled={filteredTracks.length === 0}
            aria-label="Shuffle category"
            tooltip="Shuffle Play"
            icon={<Shuffle className="w-4 h-4 text-cinema-gold" />}
          />
        </div>

        {/* Filter within loaded category */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-cinema-gold/70" />
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder={`Filter ${tracks.length} tracks...`}
            aria-label={`Filter tracks in ${categoryDef.title}`}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-cinema-panel border border-cinema-border/70 text-xs text-cinema-ivory placeholder-cinema-ivoryMuted/60 focus:outline-none focus:border-cinema-gold transition-all font-sans"
          />
        </div>
      </div>

      {/* Content Area: Loading, Error, or Tracklist */}
      {isLoading ? (
        <div className="py-20 text-center space-y-3">
          <Film className="w-8 h-8 text-cinema-gold animate-bounce mx-auto" />
          <p className="text-sm font-bold font-display uppercase tracking-wider text-cinema-ivory">
            Retrieving {categoryDef.title}...
          </p>
          <p className="text-xs text-cinema-ivoryMuted font-mono">Connecting to live cinema streams</p>
        </div>
      ) : error ? (
        <div className="p-6 rounded-2xl cinema-panel text-center max-w-md mx-auto space-y-3 border border-cinema-border/70 shadow-lg">
          <AlertTriangle className="w-8 h-8 text-cinema-vermilion mx-auto animate-pulse" />
          <h3 className="text-sm font-bold text-cinema-ivory font-sans">
            {typeof navigator !== 'undefined' && !navigator.onLine ? 'Offline Mode' : 'Stream Notice'}
          </h3>
          <p className="text-xs text-cinema-ivoryMuted font-sans">{error}</p>
          <div className="flex items-center justify-center gap-3 pt-1">
            <KeycapButton
              variant="deck"
              shape="pill"
              size="sm"
              onClick={() => setActiveView('home')}
            >
              Back to Home
            </KeycapButton>
            <KeycapButton
              variant="primary"
              shape="pill"
              size="sm"
              onClick={loadTracks}
              icon={<RotateCcw className="w-3.5 h-3.5" />}
            >
              Retry
            </KeycapButton>
          </div>
        </div>
      ) : filteredTracks.length === 0 ? (
        <div className="py-16 text-center cinema-panel rounded-2xl">
          <p className="text-sm font-bold text-cinema-ivory font-display tracking-wider uppercase">
            No tracks found matching "{filterQuery}"
          </p>
        </div>
      ) : (
        <div className="bg-cinema-surface border border-cinema-border/50 rounded-xl overflow-hidden divide-y divide-cinema-border/30">
          {filteredTracks.map((track, idx) => (
            <TrackRow
              key={`cat-track-${track.id}-${idx}`}
              track={track}
              index={idx}
              tracksContext={filteredTracks}
            />
          ))}
        </div>
      )}
    </div>
  );
};
