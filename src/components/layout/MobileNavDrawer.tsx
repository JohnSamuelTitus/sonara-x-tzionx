import React, { useState } from 'react';
import {
  X,
  Home,
  Search,
  Heart,
  Clock,
  Plus,
  Film,
  Download,
} from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';
import { DEMO_PLAYLISTS } from '../../audio/demoCatalog';
import { CreatePlaylistModal } from '../common/CreatePlaylistModal';
import { KeycapButton } from '../common/KeycapButton';

interface MobileNavDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenInstallModal: () => void;
  isStandalone: boolean;
}

export const MobileNavDrawer: React.FC<MobileNavDrawerProps> = ({
  isOpen,
  onClose,
  onOpenInstallModal,
  isStandalone,
}) => {
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

  if (!isOpen) return null;

  const navigateTo = (action: () => void) => {
    action();
    onClose();
  };

  return (
    <>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Navigation drawer"
        className="md:hidden fixed inset-0 z-50 flex animate-in fade-in duration-200"
      >
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm"
          onClick={onClose}
          aria-hidden="true"
        />

        {/* Slide-out Menu Panel */}
        <aside
          className="relative w-80 max-w-[85vw] h-full bg-gradient-to-b from-[#130E12] via-[#0D090C] to-[#080608] border-r border-cinema-gold/30 p-5 flex flex-col justify-between overflow-y-auto shadow-2xl z-10 animate-in slide-in-from-left duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="space-y-6">
            {/* Header: Brand & Close */}
            <div className="flex items-center justify-between pb-3 border-b border-cinema-border/50">
              <div
                className="flex items-center gap-3 cursor-pointer"
                onClick={() => navigateTo(() => setActiveView('home'))}
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#4A0E17] via-[#24060B] to-[#120306] flex items-center justify-center border border-cinema-gold/40 shadow-md">
                  <Film className="w-5 h-5 text-cinema-gold" />
                </div>
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="font-display text-xl tracking-wider text-cinema-ivory font-bold">
                      Sunara
                    </span>
                    <span className="font-mono text-xs font-black text-cinema-gold">
                      X TzionX
                    </span>
                  </div>
                  <p className="text-[9px] text-cinema-gold/90 font-serif italic tracking-wide lowercase">
                    luxury made affordable
                  </p>
                </div>
              </div>

              <KeycapButton
                variant="deck"
                shape="circle"
                size="xs"
                onClick={onClose}
                aria-label="Close menu"
                icon={<X className="w-4 h-4 text-cinema-ivory" />}
              />
            </div>

            {/* Install Action Card (if not running standalone) */}
            {!isStandalone && (
              <div
                onClick={() => {
                  onClose();
                  onOpenInstallModal();
                }}
                className="p-3 rounded-xl bg-gradient-to-r from-cinema-wine/60 to-cinema-panel border border-cinema-gold/40 flex items-center justify-between cursor-pointer hover:border-cinema-gold transition-all shadow-md group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Download className="w-4 h-4 text-cinema-gold flex-shrink-0 group-hover:scale-110 transition-transform" />
                  <div className="min-w-0">
                    <p className="font-sans font-bold text-xs text-cinema-ivory">Install Sonara App</p>
                    <p className="font-mono text-[9px] text-cinema-gold truncate">Native standalone playback</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded bg-cinema-gold text-black font-mono font-bold text-[9px]">
                  INSTALL
                </span>
              </div>
            )}

            {/* Main Navigation Switches */}
            <nav className="space-y-1.5" aria-label="Mobile Drawer Navigation">
              <button
                type="button"
                onClick={() => navigateTo(() => setActiveView('home'))}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  activeView === 'home' && !selectedPlaylistId
                    ? 'bg-cinema-wine/40 text-cinema-gold border border-cinema-gold/40 font-bold'
                    : 'text-cinema-ivory hover:bg-cinema-panel/70'
                }`}
              >
                <Home className="w-4 h-4 text-cinema-gold" />
                <span>Cinema Home</span>
              </button>

              <button
                type="button"
                onClick={() => navigateTo(() => setActiveView('search'))}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  activeView === 'search'
                    ? 'bg-cinema-wine/40 text-cinema-gold border border-cinema-gold/40 font-bold'
                    : 'text-cinema-ivory hover:bg-cinema-panel/70'
                }`}
              >
                <Search className="w-4 h-4 text-cinema-gold" />
                <span>Search TFI Vault</span>
              </button>
            </nav>

            {/* Library Section */}
            <div className="space-y-2">
              <h3 className="text-[10px] font-mono font-bold uppercase tracking-widest text-cinema-gold px-1">
                Your Cinema Library
              </h3>
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => navigateTo(() => selectPlaylist('special-liked'))}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors ${
                    selectedPlaylistId === 'special-liked'
                      ? 'bg-cinema-wine/40 text-cinema-gold font-bold border border-cinema-gold/30'
                      : 'text-cinema-ivory hover:bg-cinema-panel/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Heart className="w-3.5 h-3.5 text-cinema-vermilion fill-cinema-vermilion" />
                    <span>Liked Songs</span>
                  </div>
                  <span className="font-mono text-[10px] text-cinema-gold">
                    {likedTrackIds.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => navigateTo(() => selectPlaylist('special-recent'))}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors ${
                    selectedPlaylistId === 'special-recent'
                      ? 'bg-cinema-wine/40 text-cinema-gold font-bold border border-cinema-gold/30'
                      : 'text-cinema-ivory hover:bg-cinema-panel/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Clock className="w-3.5 h-3.5 text-cinema-gold" />
                    <span>Listening Tape</span>
                  </div>
                  <span className="font-mono text-[10px] text-cinema-gold">
                    {recentTrackIds.length}
                  </span>
                </button>
              </div>
            </div>

            {/* Playlists Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-[10px] font-mono font-bold uppercase tracking-widest text-cinema-gold">
                  Vault Playlists
                </h3>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="text-xs text-cinema-gold hover:text-white flex items-center gap-1 font-mono"
                  aria-label="Create playlist"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New</span>
                </button>
              </div>

              <div className="space-y-1">
                {DEMO_PLAYLISTS.map((pl) => (
                  <button
                    key={pl.id}
                    type="button"
                    onClick={() => navigateTo(() => selectPlaylist(pl.id))}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs truncate transition-colors ${
                      selectedPlaylistId === pl.id
                        ? 'bg-cinema-wine/40 text-cinema-gold font-bold border border-cinema-gold/30'
                        : 'text-cinema-ivory hover:bg-cinema-panel/60'
                    }`}
                  >
                    <span className="truncate">{pl.title}</span>
                  </button>
                ))}

                {customPlaylists.map((pl) => (
                  <button
                    key={pl.id}
                    type="button"
                    onClick={() => navigateTo(() => selectPlaylist(pl.id))}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs truncate transition-colors ${
                      selectedPlaylistId === pl.id
                        ? 'bg-cinema-wine/40 text-cinema-gold font-bold border border-cinema-gold/30'
                        : 'text-cinema-ivory hover:bg-cinema-panel/60'
                    }`}
                  >
                    <span className="truncate">{pl.title}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Attribution */}
          <div className="pt-6 mt-6 border-t border-cinema-border/40 text-center">
            <p className="text-[11px] text-cinema-ivoryMuted/70 font-mono tracking-wider">
              A product of TzionX and its team
            </p>
          </div>
        </aside>
      </div>

      <CreatePlaylistModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};
