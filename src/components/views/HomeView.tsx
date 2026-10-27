import React, { useEffect, useState, useMemo, useRef } from 'react';
import {
  Play,
  History,
  ChevronRight,
  ChevronLeft,
  Heart,
  RotateCcw,
  Disc3,
  Radio,
  Sparkles,
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

// Curated Retro Analog Spotlights using vintage cinema and radio assets
const RETRO_HERO_SPOTLIGHTS = [
  {
    id: 'hero-retro-golden',
    title: 'GOLDEN ERA RETRO VAULT',
    subtitle: 'Maestro Ilaiyaraaja · SPB · S. Janaki · K.V. Mahadevan',
    tag: 'VINTAGE ANALOG MASTER TAPE',
    badgeText: 'DOLBY B-NR · HIGH BIAS',
    tapeCode: 'TZX-REEL-78',
    tapeCounter: '04:20 · SIDE A',
    imageUrl: '/cinema/pin-retro-radio.jpg',
    categoryQuery: 'Ilaiyaraaja SPB golden hits official',
    catId: 'south-indian',
    description: 'Warm analog harmonics, lush violins, acoustic rhythm sections, and timeless celluloid melodies recorded on magnetic tape across the golden decades.',
  },
  {
    id: 'hero-retro-ilaiyaraaja',
    title: 'MAESTRO ILAIYARAAJA',
    subtitle: 'Symphonic Strings, Acoustic Flutes & Timeless 80s Nostalgia',
    tag: 'CELLULOID ORCHESTRAL CLASSICS',
    badgeText: 'PURE HARMONICS · 45 RPM',
    tapeCode: 'TZX-TAPE-82',
    tapeCounter: '08:15 · SIDE A',
    imageUrl: '/cinema/pin-vintage-hero.jpg',
    categoryQuery: 'Ilaiyaraaja Telugu classic melodies',
    catId: 'chill',
    description: 'Pioneering fusion of Indian classical ragas with Western orchestral arrangements that defined the soul of vintage South Indian cinema.',
  },
  {
    id: 'hero-retro-cassette',
    title: 'CASSETTE TAPE MEMORIES',
    subtitle: 'Geethanjali · Swarna Kamalam · Dalapathi · Roja Wave',
    tag: '90s RETRO WALKMAN NOSTALGIA',
    badgeText: 'C-90 CHROME · HI-FI',
    tapeCode: 'C-90 CHROME',
    tapeCounter: '12:44 · SIDE B',
    imageUrl: '/cinema/samantha-retro.jpg',
    categoryQuery: '90s Telugu super hit romantic songs',
    catId: 'telugu',
    description: 'Rewind the spool to the iconic era of portable tape decks, gentle tape hiss, and unforgettable cinematic melodies.',
  },
  {
    id: 'hero-retro-funk',
    title: 'RETRO VINYL & SOUL',
    subtitle: 'R.D. Burman · Kishore Kumar · Asha Bhosle Brass Grooves',
    tag: '70s RETRO BRASS & FUNK',
    badgeText: '33⅓ RPM WAX · STEREO',
    tapeCode: 'HMV-VINYL-75',
    tapeCounter: '18:02 · SIDE A',
    imageUrl: '/cinema/retro-comic.jpg',
    categoryQuery: 'RD Burman retro hits Kishore Kumar',
    catId: 'bollywood',
    description: 'Psychedelic organ riffs, explosive brass arrangements, and groovy basslines from the golden age of analog recording studios.',
  },
];

// Retro Crate Picks with authentic vintage format styling
const RETRO_QUICK_PICKS = [
  {
    id: 'pick-ilaiyaraaja',
    title: 'Maestro Ilaiyaraaja',
    subtitle: 'Violin, Flute & Raga Classics',
    img: '/cinema/pin-retro-radio.jpg',
    catId: 'south-indian',
    format: 'ANALOG MASTER',
    year: '1982',
    side: 'SIDE A',
  },
  {
    id: 'pick-spb',
    title: 'SPB Golden Melodies',
    subtitle: 'Timeless 80s & 90s Romantic Duets',
    img: '/cinema/pin-vintage-hero.jpg',
    catId: 'romantic',
    format: 'STEREO TAPE',
    year: '1989',
    side: 'SIDE A',
  },
  {
    id: 'pick-90s-telugu',
    title: '90s Cassette Nostalgia',
    subtitle: 'Geethanjali, Roja & Walkman Hits',
    img: '/cinema/samantha-retro.jpg',
    catId: 'telugu',
    format: 'C-90 CASSETTE',
    year: '1993',
    side: 'SIDE B',
  },
  {
    id: 'pick-rd-burman',
    title: 'Retro Bollywood Vinyl',
    subtitle: 'R.D. Burman & Kishore Funk',
    img: '/cinema/retro-comic.jpg',
    catId: 'bollywood',
    format: '33⅓ RPM WAX',
    year: '1975',
    side: 'SIDE A',
  },
  {
    id: 'pick-celluloid-legends',
    title: 'Celluloid Legends Radio',
    subtitle: 'Ghantasala, Susheela & K.V.M',
    img: '/cinema/pin-cinematic.jpg',
    catId: 'chill',
    format: '78 RPM SHELLAC',
    year: '1965',
    side: 'SIDE A',
  },
  {
    id: 'pick-analog-lofi',
    title: 'Analog Midnight Lo-Fi',
    subtitle: 'Warm Tube Vinyl & Tape Hiss',
    img: '/cinema/brutalist-cinema.jpg',
    catId: 'trending',
    format: 'LO-FI REEL',
    year: 'VINTAGE',
    side: 'NOCTURNE',
  },
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
  const activeHero = RETRO_HERO_SPOTLIGHTS[activeHeroIdx];

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
    const catId = activeHero.catId || 'south-indian';
    const catTracks = categoryData[catId]?.tracks || categoryData['trending']?.tracks || [];
    if (catTracks.length > 0) {
      playTrack(catTracks[0], catTracks);
    } else {
      selectCategory(catId);
    }
  };

  return (
    <div className="space-y-10 pb-16">
      {/* 1. Retro Analog Hero Showcase Banner */}
      <section className="relative rounded-2xl overflow-hidden cinema-panel border-2 border-cinema-gold/40 shadow-2xl bg-[#0E0A0C]">
        <div className="relative min-h-[340px] sm:h-88 md:h-[400px] w-full overflow-hidden flex flex-col justify-between">
          {/* Background Poster Image with Vintage Film Saturation */}
          <img
            src={activeHero.imageUrl}
            alt={activeHero.title}
            className="absolute inset-0 w-full h-full object-cover object-center filter brightness-[0.70] contrast-[1.15] sepia-[0.25] transition-all duration-700 transform hover:scale-102"
          />

          {/* Deep Vintage Gradients & Tape Texture Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0C080A] via-[#0C080A]/85 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0C080A] via-[#0C080A]/50 to-transparent" />
          <div className="absolute inset-0 bg-amber-950/20 mix-blend-color" />
          
          {/* Subtle analog tape scanlines */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.04]"
            style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.12) 1px, transparent 1px)', backgroundSize: '100% 3px' }}
          />

          {/* Foreground Hero Content */}
          <div className="relative inset-0 p-4 sm:p-8 md:p-10 flex flex-col justify-between flex-1 z-10 gap-4">
            {/* Top Analog Deck Header Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[9px] xs:text-[10px] font-bold tracking-widest uppercase px-2.5 xs:px-3 py-1 rounded-full bg-black/80 backdrop-blur-md text-cinema-gold border border-cinema-gold/50 flex items-center gap-1.5 shadow-md">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
                  {activeHero.tag}
                </span>

                <span className="hidden sm:inline-block font-mono text-[9px] text-cinema-ivoryMuted/80 px-2 py-0.5 rounded bg-black/60 border border-cinema-border/60">
                  {activeHero.badgeText}
                </span>
              </div>

              {/* Tape Deck Counter & Reel Navigator */}
              <div className="flex items-center gap-2">
                <div className="tape-counter font-mono text-[9px] xs:text-[10px] tracking-widest text-cinema-gold bg-black/80 px-2 xs:px-2.5 py-1 rounded border border-cinema-gold/40 flex items-center gap-1.5 shadow-md">
                  <Radio className="w-3 h-3 text-cinema-gold" />
                  <span>{activeHero.tapeCounter}</span>
                </div>

                {/* Spool / Reel Hub Indicator Dots */}
                <div className="flex items-center gap-1.5 bg-black/70 backdrop-blur-md p-1 rounded-full border border-cinema-gold/30">
                  {RETRO_HERO_SPOTLIGHTS.map((h, idx) => (
                    <button
                      key={h.id}
                      type="button"
                      onClick={() => setActiveHeroIdx(idx)}
                      className={`transition-all rounded-full flex items-center justify-center ${
                        activeHeroIdx === idx
                          ? 'w-5 xs:w-6 h-2.5 xs:h-3 bg-cinema-gold text-black shadow-[0_0_8px_rgba(212,175,55,0.6)]'
                          : 'w-2 h-2 bg-cinema-ivoryMuted/30 hover:bg-white'
                      }`}
                      aria-label={`Show ${h.title}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Main Title Lettering & Vintage Controls */}
            <div className="max-w-2xl space-y-2">
              <div className="inline-block font-mono text-[9px] xs:text-[10px] font-bold text-cinema-gold tracking-widest uppercase bg-cinema-wine/40 px-2 py-0.5 rounded border border-cinema-gold/30">
                REEL #{activeHero.tapeCode}
              </div>

              <h1 className="font-display text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-wider text-gold-gradient uppercase leading-tight drop-shadow-md">
                {activeHero.title}
              </h1>

              <p className="font-cinematic text-xs sm:text-sm font-semibold text-cinema-gold tracking-wide">
                {activeHero.subtitle}
              </p>

              <p className="font-sans text-xs text-cinema-ivoryMuted/90 hidden sm:block leading-relaxed line-clamp-2 max-w-xl">
                {activeHero.description}
              </p>

              {/* Tactile Retro Keycap Buttons */}
              <div className="flex flex-wrap items-center gap-2.5 pt-1.5 sm:pt-2">
                <KeycapButton
                  variant="primary"
                  shape="pill"
                  size="md"
                  onClick={handlePlayHero}
                  icon={<Play className="w-4 h-4 fill-current ml-0.5" />}
                  className="font-sans font-bold shadow-xl text-xs sm:text-sm min-h-[44px]"
                >
                  Play Retro Vault
                </KeycapButton>

                <KeycapButton
                  variant="deck"
                  shape="pill"
                  size="md"
                  onClick={() => selectCategory(activeHero.catId)}
                  icon={<Disc3 className="w-4 h-4 text-cinema-gold" />}
                  className="font-sans font-semibold text-xs sm:text-sm min-h-[44px]"
                >
                  Explore Analog Crates
                </KeycapButton>

                <span className="hidden md:inline-flex items-center gap-1 font-mono text-[9px] text-cinema-ivoryMuted/70 border border-cinema-border/50 px-2 py-1 rounded bg-black/40">
                  <Sparkles className="w-3 h-3 text-cinema-gold" />
                  33⅓ RPM HIGH-FIDELITY
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Retro Analog Picks (Vinyl & Cassette Crate Styling) */}
      <section>
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-cinema-card border border-cinema-gold/40 flex items-center justify-center shadow">
              <Disc3 className="w-4 h-4 text-cinema-gold animate-spin-slow" />
            </div>
            <div>
              <h2 className="font-display text-lg sm:text-xl tracking-wider uppercase text-cinema-ivory">
                Retro Analog Picks
              </h2>
              <p className="text-[11px] text-cinema-ivoryMuted font-sans">Hand-picked classic analog tapes &amp; vinyl crates</p>
            </div>
          </div>
          <span className="font-mono text-[10px] text-cinema-gold tracking-widest uppercase px-2.5 py-1 rounded bg-black/60 border border-cinema-gold/30">
            VINTAGE CRATES
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-3.5">
          {RETRO_QUICK_PICKS.map((item) => (
            <div
              key={item.id}
              onClick={() => selectCategory(item.catId)}
              className="group relative flex items-center gap-2.5 xs:gap-3 sm:gap-3.5 bg-gradient-to-r from-[#181116] to-[#110C0F] hover:from-[#241921] hover:to-[#1B131A] p-2 xs:p-2.5 rounded-xl overflow-hidden border border-cinema-border/60 hover:border-cinema-gold/70 transition-all duration-300 cursor-pointer shadow-md hover:shadow-[0_8px_22px_rgba(212,175,55,0.15)] hover:-translate-y-0.5"
            >
              {/* Vinyl Sleeve with Grooved Record Rim Peek */}
              <div className="relative flex-shrink-0 flex items-center">
                <img
                  src={item.img}
                  alt={item.title}
                  className="w-13 h-13 xs:w-15 xs:h-15 sm:w-16 sm:h-16 rounded-lg object-cover bg-cinema-card relative z-10 shadow-md border border-black/50 filter contrast-[1.05]"
                />
                {/* Peeking Vinyl Record Disc */}
                <div className="w-11 h-11 xs:w-13 xs:h-13 sm:w-14 sm:h-14 rounded-full bg-[#0E0A0C] border border-cinema-gold/30 -ml-5 xs:-ml-6 sm:-ml-7 group-hover:-ml-4 transition-all duration-300 flex items-center justify-center shadow-md relative z-0 pointer-events-none">
                  <div className="w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 rounded-full border border-cinema-border/50 flex items-center justify-center">
                    <div className="w-5 h-5 xs:w-5.5 xs:h-5.5 sm:w-6 sm:h-6 rounded-full bg-cinema-wine/60 border border-cinema-gold/40 flex items-center justify-center group-hover:rotate-45 transition-transform duration-500">
                      <div className="w-1.5 h-1.5 rounded-full bg-black" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Vintage Track / Artist Details */}
              <div className="min-w-0 flex-1 pr-1">
                <div className="flex items-center gap-1.5 font-mono text-[9px] text-cinema-gold/90 font-semibold tracking-wider uppercase mb-0.5">
                  <span>{item.format}</span>
                  <span className="text-cinema-ivoryMuted/40">·</span>
                  <span>{item.year}</span>
                </div>
                <h3 className="font-sans font-bold text-xs sm:text-sm text-cinema-ivory group-hover:text-cinema-gold transition-colors block truncate">
                  {item.title}
                </h3>
                <p className="font-sans text-[11px] text-cinema-ivoryMuted/80 block truncate">
                  {item.subtitle}
                </p>
              </div>

              {/* Tactile Keycap Play Button */}
              <button
                type="button"
                aria-label={`Play ${item.title}`}
                onClick={(e) => {
                  e.stopPropagation();
                  selectCategory(item.catId);
                }}
                className="keycap-base keycap-circle keycap-primary w-9 h-9 min-w-[36px] min-h-[36px] mr-0.5 xs:mr-1 flex items-center justify-center opacity-85 group-hover:opacity-100 group-hover:scale-105 transition-all shadow-lg flex-shrink-0"
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
