import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Search,
  Compass,
  Music2,
  Loader2,
  AlertTriangle,
  RotateCcw,
  Film,
  Disc3,
} from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';
import { DEMO_TRACKS, DEMO_GENRES } from '../../audio/demoCatalog';
import { TrackRow } from '../common/TrackRow';
import { KeycapButton } from '../common/KeycapButton';
import { searchYouTubeTracks } from '../../audio/youtubeApiClient';
import type { Track } from '../../types/music';

// In-memory search cache to avoid duplicate API queries
const searchCache: Record<string, { tracks: Track[]; timestamp: number }> = {};
const CACHE_LIFETIME_MS = 10 * 60 * 1000; // 10 minutes

const POPULAR_SEARCH_TAGS = [
  'They Call Him OG',
  'Anirudh Ravichander',
  'Nani Jersey',
  'Arijit Singh',
  'Baahubali Keeravani',
  'Pushpa 2 DSP',
  'Sid Sriram',
  'SPB Classics',
  'Thaman S',
  'Diljit Dosanjh',
  'Ilaiyaraaja',
  'Tamil Cinema',
  'Bollywood Hits',
  'Telugu Melodies',
];

export const SearchView: React.FC = () => {
  const { searchQuery, setSearchQuery } = usePlayer();

  const [youtubeResults, setYoutubeResults] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const activeRequestQueryRef = useRef<string>('');

  const trimmedQuery = searchQuery.trim();

  // Local demo tracks that match the query
  const matchingLocalTracks = useMemo(() => {
    if (!trimmedQuery) return [];
    const q = trimmedQuery.toLowerCase();
    return DEMO_TRACKS.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.artist.toLowerCase().includes(q) ||
        t.album.toLowerCase().includes(q) ||
        Boolean(t.genre?.toLowerCase().includes(q))
    );
  }, [trimmedQuery]);

  // Debounced search with caching and deduplication
  useEffect(() => {
    if (!trimmedQuery) {
      setYoutubeResults([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    const cached = searchCache[trimmedQuery.toLowerCase()];
    if (cached && Date.now() - cached.timestamp < CACHE_LIFETIME_MS) {
      setYoutubeResults(cached.tracks);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    activeRequestQueryRef.current = trimmedQuery;

    const timer = setTimeout(async () => {
      try {
        const res = await searchYouTubeTracks(trimmedQuery, 16);

        if (activeRequestQueryRef.current === trimmedQuery) {
          if (res.error) {
            setError(res.error);
            setYoutubeResults([]);
          } else {
            searchCache[trimmedQuery.toLowerCase()] = {
              tracks: res.tracks,
              timestamp: Date.now(),
            };
            setYoutubeResults(res.tracks);
            setError(null);
          }
          setIsLoading(false);
        }
      } catch (err: any) {
        if (activeRequestQueryRef.current === trimmedQuery) {
          setError(err.message || 'Search failed. Please try again.');
          setYoutubeResults([]);
          setIsLoading(false);
        }
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [trimmedQuery]);

  const handleRetry = () => {
    if (!trimmedQuery) return;
    delete searchCache[trimmedQuery.toLowerCase()];
    setIsLoading(true);
    setError(null);
    searchYouTubeTracks(trimmedQuery, 16)
      .then((res) => {
        if (res.error) {
          setError(res.error);
        } else {
          searchCache[trimmedQuery.toLowerCase()] = {
            tracks: res.tracks,
            timestamp: Date.now(),
          };
          setYoutubeResults(res.tracks);
        }
        setIsLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Retry failed');
        setIsLoading(false);
      });
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header and Typewriter Search Chips */}
      <div>
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-wider uppercase text-cinema-ivory flex items-center gap-2">
            <span>Cinema Search &amp; Discovery</span>
          </h1>
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cinema-panel border border-cinema-border/70 text-[10px] font-mono text-cinema-gold">
            <span className="w-1.5 h-1.5 rounded-full bg-cinema-gold animate-pulse" />
            LIVE DISCOVERY ACTIVE
          </span>
        </div>
        <p className="text-xs text-cinema-ivoryMuted font-sans mt-0.5">
          Search real songs, artists, soundtracks, and channels across TFI Cinema &amp; YouTube
        </p>

        {/* Typewriter Keycap Filter Chips */}
        <div className="flex gap-2 overflow-x-auto pt-3 pb-1 scrollbar-none">
          {POPULAR_SEARCH_TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setSearchQuery(tag)}
              className={`keycap-base keycap-square px-3 py-1.5 text-[11px] whitespace-nowrap transition-all border ${
                trimmedQuery.toLowerCase() === tag.toLowerCase()
                  ? 'keycap-primary text-white font-bold'
                  : 'keycap-deck text-cinema-ivoryMuted hover:text-cinema-ivory'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {trimmedQuery === '' ? (
        /* Default Browse Section */
        <section className="space-y-6">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-cinema-gold">
            <Compass className="w-4 h-4" />
            <span>Explore Genres &amp; Regional Music</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {DEMO_GENRES.map((genre) => (
              <div
                key={genre.id}
                onClick={() => setSearchQuery(genre.name.split(' ')[0])}
                className="relative aspect-[16/10] p-3 rounded-xl cinema-card overflow-hidden cursor-pointer hover:border-cinema-gold transition-all duration-300 shadow-md group"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${genre.color} opacity-40 group-hover:opacity-60 transition-opacity`} />
                <span className="relative z-10 font-bold font-sans text-xs sm:text-sm text-cinema-ivory block">
                  {genre.name}
                </span>
                <Music2 className="w-10 h-10 text-white/10 absolute -bottom-2 -right-2 transform group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300 pointer-events-none" />
              </div>
            ))}
          </div>

          {/* Local Cinema Archives Preview */}
          <div className="pt-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Disc3 className="w-4 h-4 text-cinema-gold" />
                <h2 className="font-display text-lg tracking-wider uppercase text-cinema-ivory">
                  Sunara Studio Audio
                </h2>
              </div>
              <span className="text-[10px] text-cinema-gold font-mono uppercase">Master Audio</span>
            </div>
            <div className="bg-cinema-surface border border-cinema-border/50 rounded-xl overflow-hidden divide-y divide-cinema-border/30">
              {DEMO_TRACKS.map((track, idx) => (
                <TrackRow key={track.id} track={track} index={idx} tracksContext={DEMO_TRACKS} />
              ))}
            </div>
          </div>
        </section>
      ) : (
        /* Results Section */
        <div className="space-y-6">
          {isLoading ? (
            /* Loading Spinner & Shimmer */
            <div className="py-20 text-center space-y-3">
              <Loader2 className="w-9 h-9 text-cinema-gold animate-spin mx-auto" />
              <p className="text-sm font-bold text-cinema-ivory font-display tracking-wider uppercase">
                Searching Cinema Streams...
              </p>
              <p className="text-xs text-cinema-ivoryMuted font-mono">
                Finding verified video streams for "{trimmedQuery}"
              </p>
            </div>
          ) : error ? (
            /* Error State with Keycap Retry / Offline Handling */
            <div className="p-6 rounded-2xl cinema-panel text-center max-w-lg mx-auto space-y-3 border border-cinema-border/70 shadow-xl">
              <AlertTriangle className="w-10 h-10 text-cinema-vermilion mx-auto animate-pulse" />
              <h3 className="text-sm font-bold text-cinema-ivory font-sans">
                {typeof navigator !== 'undefined' && !navigator.onLine ? 'Offline Search Notice' : 'Search Notice'}
              </h3>
              <p className="text-xs text-cinema-ivoryMuted leading-relaxed font-sans">{error}</p>
              {typeof navigator !== 'undefined' && !navigator.onLine && (
                <p className="text-[11px] text-cinema-gold font-mono">
                  Tip: Local library tracks and playlists remain playable offline.
                </p>
              )}
              <KeycapButton
                variant="primary"
                shape="pill"
                size="sm"
                onClick={handleRetry}
                icon={<RotateCcw className="w-3.5 h-3.5" />}
              >
                {typeof navigator !== 'undefined' && !navigator.onLine ? 'Retry Connection' : 'Retry Search'}
              </KeycapButton>
            </div>
          ) : youtubeResults.length === 0 && matchingLocalTracks.length === 0 ? (
            /* No Results */
            <div className="text-center py-16 px-4 cinema-panel rounded-2xl">
              <Search className="w-10 h-10 mx-auto text-cinema-ivoryMuted/40 mb-3" />
              <h3 className="text-base font-bold text-cinema-ivory font-display tracking-wider uppercase">
                No music results found for "{searchQuery}"
              </h3>
              <p className="text-xs text-cinema-ivoryMuted mt-1 max-w-sm mx-auto font-sans">
                {typeof navigator !== 'undefined' && !navigator.onLine
                  ? 'Live cinema search is paused while offline. Reconnect to search the full YouTube and TFI database.'
                  : 'Try searching by song name, artist (e.g., "Arijit Singh", "Anirudh", "Pawan Kalyan", "Diljit"), or check your spelling.'}
              </p>
            </div>
          ) : (
            <>
              {/* YouTube Music Results */}
              {youtubeResults.length > 0 && (
                <section>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Film className="w-4 h-4 text-cinema-gold" />
                      <h2 className="font-display text-lg tracking-wider uppercase text-cinema-ivory">
                        Cinema &amp; Live Streams ({youtubeResults.length})
                      </h2>
                    </div>
                    <span className="text-[10px] text-cinema-gold font-mono uppercase">Official Video Streams</span>
                  </div>
                  <div className="bg-cinema-surface border border-cinema-border/50 rounded-xl overflow-hidden divide-y divide-cinema-border/30">
                    {youtubeResults.map((track, idx) => (
                      <TrackRow
                        key={`yt-res-${track.id}-${idx}`}
                        track={track}
                        index={idx}
                        tracksContext={youtubeResults}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* Local Catalog Matches */}
              {matchingLocalTracks.length > 0 && (
                <section>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="font-display text-lg tracking-wider uppercase text-cinema-ivory">
                      Sunara Studio Audio ({matchingLocalTracks.length})
                    </h2>
                    <span className="text-[10px] text-cinema-gold font-mono uppercase">Master Audio</span>
                  </div>
                  <div className="bg-cinema-surface border border-cinema-border/50 rounded-xl overflow-hidden divide-y divide-cinema-border/30">
                    {matchingLocalTracks.map((track, idx) => (
                      <TrackRow
                        key={`local-res-${track.id}-${idx}`}
                        track={track}
                        index={idx}
                        tracksContext={matchingLocalTracks}
                      />
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};
