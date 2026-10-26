import React, { useEffect, useState, useMemo, useRef } from 'react';
import {
  Play,
  Film,
  History,
  ChevronRight,
  ChevronLeft,
  Heart,
  RotateCcw,
  Flame,
} from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';
import { DEMO_TRACKS } from '../../audio/demoCatalog';
import { Card } from '../common/Card';
import { TrackRow } from '../common/TrackRow';
import { KeycapButton } from '../common/KeycapButton';
import { fetchCategoryTracks } from '../../audio/youtubeApiClient';
import { CATEGORY_DEFINITIONS } from '../../audio/categoryConstants';
import type { Track } from '../../types/music';

// In-memory module-level cache for home view category tracks
const homeCategoryCache: Record<string, { tracks: Track[]; timestamp: number }> = {};
const CACHE_LIFETIME_MS = 15 * 60 * 1000; // 15 minutes

interface CategoryState {
  tracks: Track[];
  loading: boolean;
  error: string | null;
}

// Curated Cinematic Hero Spotlights using verified local Pinterest assets
const HERO_SPOTLIGHTS = [
  {
    id: 'hero-og',
    title: 'THEY CALL HIM OG',
    subtitle: 'Power Star Pawan Kalyan · Thaman S High-Voltage Firestorm',
    tag: 'TFI MASS ANTHEM',
    imageUrl: '/cinema/og-pawan-kalyan.jpg',
    categoryQuery: 'They Call Him OG songs official video',
    description: 'Relentless bass drops, thunderous brass, and iconic whistle themes composed for the big screen.',
  },
  {
    id: 'hero-baahubali',
    title: 'BAAHUBALI LEGACY',
    subtitle: 'Rebel Star Prabhas · M.M. Keeravani Orchestral Epics',
    tag: 'HISTORIC SYMPHONY',
    imageUrl: '/cinema/prabhas-baahubali.jpg',
    categoryQuery: 'Baahubali songs official Keeravani video',
    description: 'Immense choral vocals, traditional Indian percussion, and timeless cinematic grandeur.',
  },
  {
    id: 'hero-jersey',
    title: 'JERSEY CLASSICS',
    subtitle: 'Natural Star Nani · Anirudh Ravichander Soul Melodies',
    tag: 'HEARTFELT EMOTION',
    imageUrl: '/cinema/nani-jersey.jpg',
    categoryQuery: 'Jersey movie songs Anirudh official',
    description: 'Poignant acoustic ballads and uplifting sports anthems that define modern Telugu cinema.',
  },
  {
    id: 'hero-anirudh',
    title: 'ANIRUDH WAVE',
    subtitle: 'Rockstar Anirudh · High-Octane South & Telugu Chartbusters',
    tag: 'MODERN VIRAL HITS',
    imageUrl: '/cinema/anirudh-rockstar.jpg',
    categoryQuery: 'Anirudh superhit songs official music video',
    description: 'Electronic synth lines fused with Indian kuthu rhythms and infectious vocal hooks.',
  },
];

// Quick Picks with local cinema poster art
const CINEMA_QUICK_PICKS = [
  { id: 'pick-og', title: 'They Call Him OG', subtitle: 'Pawan Kalyan · Thaman S', img: '/cinema/og-pawan-kalyan.jpg', catId: 'telugu' },
  { id: 'pick-jersey', title: 'Jersey Classics', subtitle: 'Nani · Anirudh', img: '/cinema/nani-jersey.jpg', catId: 'romantic' },
  { id: 'pick-baahubali', title: 'Baahubali Legacy', subtitle: 'Prabhas · Keeravani', img: '/cinema/prabhas-baahubali.jpg', catId: 'south-indian' },
  { id: 'pick-pushpa', title: 'Pushpa 2 The Rule', subtitle: 'Allu Arjun · DSP', img: '/cinema/allu-arjun-pushpa.jpg', catId: 'party' },
  { id: 'pick-anirudh', title: 'Anirudh Spotlight', subtitle: 'Rockstar Hits', img: '/cinema/anirudh-rockstar.jpg', catId: 'trending' },
  { id: 'pick-retro', title: 'Golden Era Radio', subtitle: 'Ghantasala & SPB', img: '/cinema/retro-comic.jpg', catId: 'chill' },
];

export const HomeView: React.FC = () => {
  const {
    playTrack,
    currentTrack,
    isPlaying,
    isLiked,
    toggleLike,
    selectPlaylist,
    selectCategory,
    recentTrackIds,
    likedTrackIds,
    getTrackById,
  } = usePlayer();

  const [activeHeroIdx, setActiveHeroIdx] = useState(0);
  const activeHero = HERO_SPOTLIGHTS[activeHeroIdx];

  const [categoryData, setCategoryData] = useState<Record<string, CategoryState>>(() => {
    const initial: Record<string, CategoryState> = {};
    (CATEGORY_DEFINITIONS as any[]).forEach((cat: any) => {
      const cached = homeCategoryCache[cat.id];
      if (cached && Date.now() - cached.timestamp < CACHE_LIFETIME_MS) {
        initial[cat.id] = { tracks: cached.tracks, loading: false, error: null };
      } else {
        initial[cat.id] = { tracks: [], loading: true, error: null };
      }
    });
    return initial;
  });

  const scrollRowRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Personalized section: Recently Played tracks
  const recentTracks = useMemo(() => {
    return recentTrackIds
      .map((id) => getTrackById(id) || DEMO_TRACKS.find((t) => t.id === id))
      .filter((t): t is Track => Boolean(t))
      .slice(0, 8);
  }, [recentTrackIds, getTrackById]);

  // Personalized section: Liked Tracks
  const likedTracks = useMemo(() => {
    return likedTrackIds
      .map((id) => getTrackById(id) || DEMO_TRACKS.find((t) => t.id === id))
      .filter((t): t is Track => Boolean(t))
      .slice(0, 8);
  }, [likedTrackIds, getTrackById]);

  // Load a single category with caching and error handling
  const loadCategory = async (categoryId: string, force = false) => {
    const cached = homeCategoryCache[categoryId];
    if (!force && cached && Date.now() - cached.timestamp < CACHE_LIFETIME_MS) {
      setCategoryData((prev) => ({
        ...prev,
        [categoryId]: { tracks: cached.tracks, loading: false, error: null },
      }));
      return;
    }

    setCategoryData((prev) => ({
      ...prev,
      [categoryId]: { tracks: prev[categoryId]?.tracks || [], loading: true, error: null },
    }));

    try {
      const res = await fetchCategoryTracks(categoryId, 10);
      if (res.error) {
        setCategoryData((prev) => ({
          ...prev,
          [categoryId]: { tracks: [], loading: false, error: res.error || 'Failed to load tracks' },
        }));
      } else {
        homeCategoryCache[categoryId] = { tracks: res.tracks, timestamp: Date.now() };
        setCategoryData((prev) => ({
          ...prev,
          [categoryId]: { tracks: res.tracks, loading: false, error: null },
        }));
      }
    } catch (err: any) {
      setCategoryData((prev) => ({
        ...prev,
        [categoryId]: {
          tracks: [],
          loading: false,
          error: err.message || 'Network error while loading category tracks',
        },
      }));
    }
  };

  // Progressive loading strategy
  useEffect(() => {
    const priorityCategories = ['trending', 'bollywood', 'south-indian', 'punjabi', 'telugu'];
    const secondaryCategories = (CATEGORY_DEFINITIONS as any[])
      .filter((c: any) => !priorityCategories.includes(c.id))
      .map((c: any) => c.id);

    priorityCategories.forEach((catId: string) => {
      loadCategory(catId);
    });

    const timer = setTimeout(() => {
      secondaryCategories.forEach((catId: string, index: number) => {
        setTimeout(() => {
          loadCategory(catId);
        }, index * 200);
      });
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  // Horizontal row scroll helper
  const handleScroll = (categoryId: string, direction: 'left' | 'right') => {
    const el = scrollRowRefs.current[categoryId];
    if (!el) return;
    const scrollAmount = direction === 'left' ? -380 : 380;
    el.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  // Play hero spotlight track
  const handlePlayHero = () => {
    const trendingTracks = categoryData['trending']?.tracks || [];
    if (trendingTracks.length > 0) {
      playTrack(trendingTracks[0], trendingTracks);
    } else {
      selectCategory('trending');
    }
  };

  return (
    <div className="space-y-10 pb-16">
      {/* 1. Cinematic Hero Showcase Banner */}
      <section className="relative rounded-2xl overflow-hidden cinema-panel border-2 border-cinema-border/70 shadow-2xl">
        <div className="relative h-72 sm:h-80 md:h-96 w-full overflow-hidden">
          {/* Background Poster Image */}
          <img
            src={activeHero.imageUrl}
            alt={activeHero.title}
            className="w-full h-full object-cover object-center filter brightness-[0.75] contrast-[1.1] transition-all duration-700 transform hover:scale-102"
          />

          {/* Deep Wine Red, Charcoal & Vignette Lighting Gradients */}
          <div className="absolute inset-0 bg-gradient-to-r from-cinema-bg via-cinema-bg/85 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-cinema-bg via-cinema-bg/40 to-transparent" />
          <div className="absolute inset-0 bg-cinema-wine/25 mix-blend-color" />

          {/* Foreground Hero Content */}
          <div className="absolute inset-0 p-4 sm:p-8 md:p-10 flex flex-col justify-between z-10">
            {/* Top Badge & Selector Pills */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="font-mono text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full bg-black/70 backdrop-blur-md text-cinema-gold border border-cinema-gold/40 flex items-center gap-1.5 shadow-md">
                <Flame className="w-3.5 h-3.5 text-cinema-vermilion" />
                {activeHero.tag}
              </span>

              {/* Spotlight Navigator Pills */}
              <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md p-1 rounded-full border border-cinema-border/60">
                {HERO_SPOTLIGHTS.map((h, idx) => (
                  <button
                    key={h.id}
                    type="button"
                    onClick={() => setActiveHeroIdx(idx)}
                    className={`h-2 transition-all rounded-full ${
                      activeHeroIdx === idx ? 'w-6 bg-cinema-gold' : 'w-2 bg-cinema-ivoryMuted/40 hover:bg-white'
                    }`}
                    aria-label={`Show ${h.title}`}
                  />
                ))}
              </div>
            </div>

            {/* Main Title Lettering & Actions */}
            <div className="max-w-xl space-y-3">
              <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-wider text-cinema-ivory uppercase leading-none drop-shadow-md">
                {activeHero.title}
              </h1>
              <p className="font-sans text-xs sm:text-sm font-semibold text-cinema-gold">
                {activeHero.subtitle}
              </p>
              <p className="font-sans text-xs text-cinema-ivoryMuted hidden sm:block leading-relaxed line-clamp-2">
                {activeHero.description}
              </p>

              {/* Tactile Keycap Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <KeycapButton
                  variant="primary"
                  shape="pill"
                  size="md"
                  onClick={handlePlayHero}
                  icon={<Play className="w-4 h-4 fill-current ml-0.5" />}
                  className="font-sans font-bold shadow-xl"
                >
                  Play Spotlight
                </KeycapButton>

                <KeycapButton
                  variant="deck"
                  shape="pill"
                  size="md"
                  onClick={() => selectCategory('south-indian')}
                  icon={<Film className="w-4 h-4 text-cinema-gold" />}
                  className="font-sans font-semibold"
                >
                  Explore TFI Vault
                </KeycapButton>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Cinema Quick Picks (6-Grid with Verified Local Cinema Art) */}
      <section>
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <Film className="w-4 h-4 text-cinema-gold" />
            <h2 className="font-display text-lg tracking-wider uppercase text-cinema-ivory">
              Cinema Quick Picks
            </h2>
          </div>
          <span className="font-mono text-[10px] text-cinema-gold tracking-widest uppercase">
            TFI Curated
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {CINEMA_QUICK_PICKS.map((item) => (
            <div
              key={item.id}
              onClick={() => selectCategory(item.catId)}
              className="group flex items-center gap-3.5 bg-cinema-panel/70 hover:bg-cinema-card rounded-xl overflow-hidden border border-cinema-border/50 hover:border-cinema-gold/60 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-lg"
            >
              <img
                src={item.img}
                alt={item.title}
                className="w-16 h-16 object-cover bg-cinema-card flex-shrink-0"
              />
              <div className="min-w-0 flex-1 pr-2">
                <span className="font-sans font-bold text-xs text-cinema-ivory group-hover:text-cinema-gold transition-colors block truncate">
                  {item.title}
                </span>
                <span className="font-sans text-[11px] text-cinema-ivoryMuted block truncate">
                  {item.subtitle}
                </span>
              </div>
              <button
                type="button"
                aria-label={`Play ${item.title}`}
                onClick={(e) => {
                  e.stopPropagation();
                  selectCategory(item.catId);
                }}
                className="keycap-base keycap-circle keycap-primary w-9 h-9 mr-3 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
              >
                <Play className="w-4 h-4 fill-current ml-0.5" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Personalized: Recently Played */}
      {recentTracks.length > 0 && (
        <section aria-label="Recently Played Tracks">
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-cinema-gold" />
              <div>
                <h2 className="font-display text-lg tracking-wider uppercase text-cinema-ivory">
                  Recently Played
                </h2>
                <p className="text-[11px] text-cinema-ivoryMuted font-sans">Tracks from your active listening tape</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => selectPlaylist('special-recent')}
              className="text-xs font-mono font-semibold text-cinema-gold hover:underline flex items-center gap-1"
            >
              <span>Show all</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
            {recentTracks.slice(0, 6).map((track) => (
              <Card
                key={`recent-${track.id}`}
                id={track.id}
                title={track.title}
                subtitle={track.artist}
                imageUrl={track.coverUrl}
                badge="RECENT"
                isPlaying={currentTrack?.id === track.id && isPlaying}
                isLiked={isLiked(track.id)}
                onPlayClick={() => playTrack(track, recentTracks)}
                onLikeClick={() => toggleLike(track.id, track)}
                onClick={() => playTrack(track, recentTracks)}
              />
            ))}
          </div>
        </section>
      )}

      {/* 4. Curated Discovery Sections with Horizontal Scrolling */}
      {CATEGORY_DEFINITIONS.map((cat: any) => {
        const state = categoryData[cat.id] || { tracks: [], loading: false, error: null };
        const tracks = state.tracks;

        return (
          <section key={cat.id} aria-label={cat.title} className="space-y-3">
            {/* Category Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-lg sm:text-xl tracking-wider uppercase text-cinema-ivory flex items-center gap-2">
                  <span>{cat.title}</span>
                </h2>
                <p className="text-xs text-cinema-ivoryMuted font-sans mt-0.5">{cat.subtitle}</p>
              </div>

              {/* Action Keycaps & Scroll Chevrons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => selectCategory(cat.id)}
                  className="text-xs font-mono font-semibold text-cinema-gold hover:underline flex items-center gap-1 mr-2"
                >
                  <span>Explore</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>

                <KeycapButton
                  variant="deck"
                  shape="circle"
                  size="xs"
                  onClick={() => handleScroll(cat.id, 'left')}
                  aria-label={`Scroll ${cat.title} left`}
                  icon={<ChevronLeft className="w-3.5 h-3.5" />}
                />
                <KeycapButton
                  variant="deck"
                  shape="circle"
                  size="xs"
                  onClick={() => handleScroll(cat.id, 'right')}
                  aria-label={`Scroll ${cat.title} right`}
                  icon={<ChevronRight className="w-3.5 h-3.5" />}
                />
              </div>
            </div>

            {/* Error or Empty State */}
            {state.error ? (
              <div className="p-4 rounded-xl bg-cinema-panel/40 border border-cinema-border/50 text-xs text-cinema-ivoryMuted flex items-center justify-between">
                <span>{state.error}</span>
                <KeycapButton
                  variant="deck"
                  shape="square"
                  size="xs"
                  onClick={() => loadCategory(cat.id, true)}
                  icon={<RotateCcw className="w-3 h-3" />}
                >
                  Retry
                </KeycapButton>
              </div>
            ) : state.loading && tracks.length === 0 ? (
              /* Shimmer Loading Grid */
              <div className="flex gap-3.5 overflow-x-hidden py-1">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={`skeleton-${cat.id}-${i}`}
                    className="w-40 sm:w-48 flex-shrink-0 p-3 rounded-xl cinema-card animate-pulse space-y-2.5"
                  >
                    <div className="aspect-square w-full rounded-lg bg-cinema-panel" />
                    <div className="h-3.5 bg-cinema-panel rounded w-3/4" />
                    <div className="h-2.5 bg-cinema-panel rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : tracks.length > 0 ? (
              /* Horizontal Track Row */
              <div
                ref={(el) => {
                  scrollRowRefs.current[cat.id] = el;
                }}
                className="flex gap-3.5 overflow-x-auto pb-2 scrollbar-none scroll-smooth"
              >
                {tracks.map((track) => (
                  <div key={track.id} className="w-40 sm:w-48 flex-shrink-0">
                    <Card
                      id={track.id}
                      title={track.title}
                      subtitle={track.artist}
                      imageUrl={track.coverUrl}
                      badge={cat.title.split(' ')[0]}
                      isPlaying={currentTrack?.id === track.id && isPlaying}
                      isLiked={isLiked(track.id)}
                      onPlayClick={() => playTrack(track, tracks)}
                      onLikeClick={() => toggleLike(track.id, track)}
                      onClick={() => playTrack(track, tracks)}
                    />
                  </div>
                ))}
              </div>
            ) : null}
          </section>
        );
      })}

      {/* 5. Personalized: Liked Songs Collection */}
      {likedTracks.length > 0 && (
        <section aria-label="Liked Songs Showcase">
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-cinema-vermilion" />
              <div>
                <h2 className="font-display text-lg tracking-wider uppercase text-cinema-ivory">
                  From Your Vault
                </h2>
                <p className="text-[11px] text-cinema-ivoryMuted font-sans">Tracks you favorited in your library</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => selectPlaylist('special-liked')}
              className="text-xs font-mono font-semibold text-cinema-gold hover:underline flex items-center gap-1"
            >
              <span>View all</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="bg-cinema-surface border border-cinema-border/50 rounded-xl overflow-hidden divide-y divide-cinema-border/30">
            {likedTracks.slice(0, 5).map((track, idx) => (
              <TrackRow
                key={`liked-row-${track.id}`}
                track={track}
                index={idx}
                tracksContext={likedTracks}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
