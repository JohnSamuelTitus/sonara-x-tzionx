import React, { useState } from 'react';
import { Home, Search, Library, Plus, Heart, Music, Disc3, Clock, Film, Download } from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';
import { DEMO_PLAYLISTS } from '../../audio/demoCatalog';
import { CreatePlaylistModal } from '../common/CreatePlaylistModal';
import { KeycapButton } from '../common/KeycapButton';

interface SidebarProps {
  onOpenInstallModal?: () => void;
  isStandalone?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ onOpenInstallModal, isStandalone = false }) => {
  const {
    activeView,
    setActiveView,
    selectedPlaylistId,
    selectPlaylist,
    customPlaylists,
    likedTrackIds,
    recentTrackIds,
  } = usePlayer();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const isHomeActive = activeView === 'home' && !selectedPlaylistId;
  const isSearchActive = activeView === 'search';

  return (
    <>
      <aside className="hidden md:flex md:w-56 lg:w-64 flex-shrink-0 flex-col bg-gradient-to-b from-[#130E12] via-[#0D090C] to-[#080608] border-r border-cinema-gold/20 p-3.5 lg:p-4 gap-3.5 h-full select-none shadow-[4px_0_24px_rgba(0,0,0,0.6)] relative z-20">
        {/* Brand Header — Sunara X TzionX with luxury tagline */}
        <div
          className="flex items-center gap-3 px-2 py-2 cursor-pointer group rounded-xl hover:bg-cinema-panel/30 transition-all border border-transparent hover:border-cinema-gold/25"
          onClick={() => setActiveView('home')}
        >
          {/* Luxury Crest Badge */}
          <div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-[#4A0E17] via-[#24060B] to-[#120306] flex items-center justify-center shadow-lg border border-cinema-gold/40 text-cinema-ivory flex-shrink-0 group-hover:scale-105 group-hover:border-cinema-gold transition-all duration-300">
            <div className="absolute inset-0 rounded-xl bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cinema-gold/25 via-transparent to-transparent opacity-80" />
            <Film className="w-5 h-5 text-cinema-gold drop-shadow-[0_0_8px_rgba(212,175,55,0.7)]" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-cinema-vermilion border-2 border-cinema-surface shadow-sm" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-baseline gap-1.5 leading-none">
              <span className="font-display text-2xl tracking-wider text-cinema-ivory font-bold drop-shadow-sm">
                Sunara
              </span>
              <span className="font-mono text-xs font-black text-cinema-gold tracking-tight">
                X TzionX
              </span>
            </div>
            <div
              className="mt-1 flex items-center gap-1.5"
              title="luxury made affortable"
              data-tagline="luxury made affortable"
            >
              <span className="w-2 h-px bg-cinema-gold/60" />
              <p className="text-[10px] text-cinema-gold/90 font-serif italic tracking-wide lowercase">
                luxury made affordable
              </p>
              <span className="w-2 h-px bg-cinema-gold/60" />
            </div>
          </div>
        </div>

        {/* Primary Navigation — Luxury Console Switches */}
        <nav className="flex flex-col gap-2" aria-label="Main Navigation">
          <button
            type="button"
            onClick={() => setActiveView('home')}
            className={`keycap-base keycap-square w-full px-3 py-2.5 text-xs text-left justify-start gap-2.5 rounded-lg transition-all ${
              isHomeActive ? 'keycap-nav-active font-bold' : 'keycap-nav-idle font-medium'
            }`}
          >
            <span
              className={`w-1.5 h-3.5 rounded-full transition-all flex-shrink-0 ${
                isHomeActive
                  ? 'bg-cinema-gold shadow-[0_0_8px_rgba(212,175,55,0.9)]'
                  : 'bg-cinema-border/50'
              }`}
            />
            <Home
              className={`w-4 h-4 flex-shrink-0 transition-colors ${
                isHomeActive ? 'text-cinema-gold' : 'text-cinema-ivoryMuted'
              }`}
            />
            <span className="font-sans tracking-wide text-xs flex-1">Cinema Home</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveView('search')}
            className={`keycap-base keycap-square w-full px-3 py-2.5 text-xs text-left justify-start gap-2.5 rounded-lg transition-all ${
              isSearchActive ? 'keycap-nav-active font-bold' : 'keycap-nav-idle font-medium'
            }`}
          >
            <span
              className={`w-1.5 h-3.5 rounded-full transition-all flex-shrink-0 ${
                isSearchActive
                  ? 'bg-cinema-gold shadow-[0_0_8px_rgba(212,175,55,0.9)]'
                  : 'bg-cinema-border/50'
              }`}
            />
            <Search
              className={`w-4 h-4 flex-shrink-0 transition-colors ${
                isSearchActive ? 'text-cinema-gold' : 'text-cinema-ivoryMuted'
              }`}
            />
            <span className="font-sans tracking-wide text-xs flex-1">Search &amp; Discovery</span>
          </button>
        </nav>

        {/* Brass Filigree Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-cinema-gold/30 to-transparent my-0.5" />

        {/* Library Section Header */}
        <div className="flex items-center justify-between px-2 text-[10.5px] font-mono uppercase tracking-[0.18em] text-cinema-gold font-semibold">
          <div className="flex items-center gap-2">
            <Library className="w-3.5 h-3.5 text-cinema-gold" />
            <span>Vault &amp; Archives</span>
          </div>
          <KeycapButton
            variant="gold"
            shape="square"
            size="xs"
            onClick={() => setIsModalOpen(true)}
            aria-label="Create new playlist"
            tooltip="New Playlist"
            icon={<Plus className="w-3 h-3 text-cinema-bg font-bold" />}
          />
        </div>

        {/* Special Collections: Liked Songs & Recently Played */}
        <div className="flex flex-col gap-2">
          {/* Liked Songs */}
          <button
            type="button"
            onClick={() => selectPlaylist('special-liked')}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs transition-all border ${
              selectedPlaylistId === 'special-liked'
                ? 'bg-gradient-to-r from-cinema-wine/90 via-cinema-wine/60 to-cinema-panel border-cinema-gold/60 text-cinema-ivory font-semibold shadow-[0_0_14px_rgba(74,14,23,0.5)]'
                : 'bg-gradient-to-r from-cinema-panel/70 to-cinema-card/50 border-cinema-border/50 text-cinema-ivoryMuted hover:text-cinema-ivory hover:border-cinema-gold/35 hover:bg-cinema-panel'
            }`}
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cinema-vermilion via-cinema-wine to-[#24060B] flex items-center justify-center text-white shadow-md border border-cinema-gold/30 flex-shrink-0">
              <Heart className="w-3.5 h-3.5 fill-current text-white drop-shadow-[0_0_4px_rgba(255,255,255,0.6)]" />
            </div>
            <div className="min-w-0 text-left flex-1">
              <p className="truncate font-sans font-semibold text-cinema-ivory text-xs">Liked Songs</p>
              <div className="mt-0.5 flex items-center">
                <span className="tape-counter text-[9px] px-1.5 py-0.2 rounded border border-cinema-gold/30">
                  {likedTrackIds.length} REELS
                </span>
              </div>
            </div>
          </button>

          {/* Recently Played */}
          <button
            type="button"
            onClick={() => selectPlaylist('special-recent')}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs transition-all border ${
              selectedPlaylistId === 'special-recent'
                ? 'bg-gradient-to-r from-cinema-wine/90 via-cinema-wine/60 to-cinema-panel border-cinema-gold/60 text-cinema-ivory font-semibold shadow-[0_0_14px_rgba(74,14,23,0.5)]'
                : 'bg-gradient-to-r from-cinema-panel/70 to-cinema-card/50 border-cinema-border/50 text-cinema-ivoryMuted hover:text-cinema-ivory hover:border-cinema-gold/35 hover:bg-cinema-panel'
            }`}
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cinema-gold via-amber-700 to-[#24060B] flex items-center justify-center text-cinema-bg shadow-md border border-cinema-gold/40 flex-shrink-0">
              <Clock className="w-3.5 h-3.5 text-cinema-bg font-bold" />
            </div>
            <div className="min-w-0 text-left flex-1">
              <p className="truncate font-sans font-semibold text-cinema-ivory text-xs">Recently Played</p>
              <div className="mt-0.5 flex items-center">
                <span className="tape-counter text-[9px] px-1.5 py-0.2 rounded border border-cinema-gold/30">
                  {recentTrackIds.length} TRACKS
                </span>
              </div>
            </div>
          </button>
        </div>

        {/* Playlists & Collections Scroll Area */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
          {/* Custom User Playlists */}
          {customPlaylists.map((pl) => {
            const isSelected = selectedPlaylistId === pl.id;
            return (
              <button
                key={pl.id}
                type="button"
                onClick={() => selectPlaylist(pl.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-left transition-all border group ${
                  isSelected
                    ? 'bg-cinema-wine/50 border-cinema-gold/50 text-cinema-gold font-semibold shadow-inner'
                    : 'border-cinema-border/30 hover:border-cinema-gold/30 text-cinema-ivoryMuted hover:text-cinema-ivory hover:bg-cinema-panel/40'
                }`}
              >
                <Disc3
                  className={`w-3.5 h-3.5 flex-shrink-0 transition-transform duration-300 ${
                    isSelected
                      ? 'text-cinema-gold animate-spin-slow'
                      : 'text-cinema-gold/70 group-hover:rotate-45'
                  }`}
                />
                <div className="min-w-0 flex-1 truncate">
                  <p className="truncate font-sans text-xs">{pl.title}</p>
                  <p className="text-[9.5px] text-cinema-gold/60 font-mono tracking-wider">
                    {pl.trackIds.length} tracks
                  </p>
                </div>
              </button>
            );
          })}

          {/* Curated Cinema Vault */}
          <div className="pt-2">
            <p className="px-2.5 py-1 text-[9.5px] font-mono tracking-[0.2em] text-cinema-gold/70 uppercase">
              Curated Master Tapes
            </p>
            <div className="space-y-1">
              {DEMO_PLAYLISTS.map((pl) => {
                const isSelected = selectedPlaylistId === pl.id;
                return (
                  <button
                    key={pl.id}
                    type="button"
                    onClick={() => selectPlaylist(pl.id)}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs text-left transition-colors truncate group ${
                      isSelected
                        ? 'bg-cinema-wine/40 text-cinema-gold font-semibold border border-cinema-gold/30'
                        : 'text-cinema-ivoryMuted hover:text-cinema-ivory hover:bg-cinema-panel/30 border border-transparent'
                    }`}
                  >
                    <Music className="w-3 h-3 flex-shrink-0 text-cinema-gold/60 group-hover:text-cinema-gold" />
                    <span className="truncate font-sans text-xs flex-1">{pl.title}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Install Sonara Action (if in browser tab) */}
        {!isStandalone && onOpenInstallModal && (
          <button
            type="button"
            onClick={onOpenInstallModal}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-gradient-to-r from-cinema-wine/60 to-cinema-panel border border-cinema-gold/40 text-cinema-ivory hover:border-cinema-gold text-xs font-sans shadow-md group transition-all"
          >
            <div className="flex items-center gap-2">
              <Download className="w-3.5 h-3.5 text-cinema-gold group-hover:scale-110 transition-transform" />
              <span className="font-semibold text-xs">Install App</span>
            </div>
            <span className="text-[9px] font-mono text-cinema-gold font-bold px-1.5 py-0.5 rounded bg-cinema-panel border border-cinema-gold/30">
              PWA
            </span>
          </button>
        )}

        {/* Deck Status Footer */}
        <div className="pt-2.5 border-t border-cinema-gold/20 text-[10px] text-cinema-ivoryMuted font-mono leading-tight px-1 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cinema-gold shadow-[0_0_8px_rgba(212,175,55,0.8)] animate-pulse" />
            <span className="text-cinema-ivory font-bold tracking-wider text-[10px] uppercase">
              Sunara Console
            </span>
          </div>
          <span className="text-[9px] font-bold text-cinema-gold px-2 py-0.5 rounded bg-cinema-panel border border-cinema-gold/30 shadow-inner">
            HI-FI LOSSLESS
          </span>
        </div>
      </aside>

      {/* Playlist Creation Modal */}
      <CreatePlaylistModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};
