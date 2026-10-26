import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Search,
  ListMusic,
  Disc3,
  Menu,
  Download,
} from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';
import { KeycapButton } from '../common/KeycapButton';

interface TopBarProps {
  onOpenMobileMenu?: () => void;
  onOpenInstallModal?: () => void;
  isStandalone?: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  onOpenMobileMenu,
  onOpenInstallModal,
  isStandalone = false,
}) => {
  const {
    activeView,
    setActiveView,
    searchQuery,
    setSearchQuery,
    isQueueOpen,
    setIsQueueOpen,
  } = usePlayer();

  return (
    <header className="h-16 flex items-center justify-between px-3 sm:px-6 bg-cinema-surface/90 border-b border-cinema-border/50 backdrop-blur-md z-30 select-none gap-2">
      {/* Left: Mobile Menu Trigger + History Navigation Keycaps */}
      <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
        {/* Mobile Brand / Menu Keycap */}
        {onOpenMobileMenu && (
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="md:hidden flex items-center justify-center w-9 h-9 rounded-xl bg-cinema-panel border border-cinema-gold/30 text-cinema-gold hover:border-cinema-gold transition-colors flex-shrink-0"
            aria-label="Open navigation menu"
          >
            <Menu className="w-4 h-4" />
          </button>
        )}

        <KeycapButton
          variant="deck"
          shape="circle"
          size="sm"
          onClick={() => setActiveView('home')}
          disabled={activeView === 'home'}
          aria-label="Back to home"
          tooltip="Home"
          className="hidden sm:inline-flex"
          icon={<ChevronLeft className="w-4 h-4 text-cinema-ivory" />}
        />
        <KeycapButton
          variant="deck"
          shape="circle"
          size="sm"
          onClick={() => setActiveView('search')}
          disabled={activeView === 'search'}
          aria-label="Forward to search"
          tooltip="Search"
          className="hidden sm:inline-flex"
          icon={<ChevronRight className="w-4 h-4 text-cinema-ivory" />}
        />
      </div>

      {/* Center Search Input */}
      <div className="flex-1 max-w-md mx-1 sm:mx-4 min-w-0">
        <div className="relative flex items-center">
          <Search className="w-3.5 sm:w-4 h-3.5 sm:h-4 absolute left-3 text-cinema-gold/70 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            placeholder="Search TFI hits, artists, soundtracks..."
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (activeView !== 'search') {
                setActiveView('search');
              }
            }}
            onFocus={() => {
              if (activeView !== 'search') {
                setActiveView('search');
              }
            }}
            aria-label="Search tracks"
            className="w-full pl-8 sm:pl-10 pr-3 py-1.5 sm:py-2 rounded-xl bg-cinema-panel/80 border border-cinema-border/70 text-xs text-cinema-ivory placeholder-cinema-ivoryMuted/60 focus:outline-none focus:border-cinema-gold focus:ring-1 focus:ring-cinema-gold transition-all font-sans"
          />
        </div>
      </div>

      {/* Right controls: Install button + Stereo Deck Indicator & Mobile Queue Keycap */}
      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
        {/* Install Sonara Action Button (visible when not running standalone) */}
        {!isStandalone && onOpenInstallModal && (
          <KeycapButton
            variant="gold"
            shape="pill"
            size="xs"
            onClick={onOpenInstallModal}
            aria-label="Install Sonara app"
            tooltip="Install App"
            icon={<Download className="w-3.5 h-3.5 text-cinema-bg" />}
            className="font-mono text-[10px] hidden xs:inline-flex sm:inline-flex"
          >
            <span className="hidden sm:inline">Install</span>
          </KeycapButton>
        )}

        <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-cinema-panel/90 border border-cinema-border/60 text-[11px] text-cinema-ivoryMuted font-mono">
          <Disc3 className="w-3.5 h-3.5 text-cinema-gold animate-spin-slow flex-shrink-0" />
          <span className="font-semibold text-cinema-ivory">STEREO DECK</span>
          <span className="text-cinema-gold font-bold">· HI-FI</span>
        </div>

        <KeycapButton
          variant={isQueueOpen ? 'primary' : 'deck'}
          shape="square"
          size="sm"
          onClick={() => setIsQueueOpen(!isQueueOpen)}
          aria-label="Toggle playback queue"
          tooltip="Queue"
          className="md:hidden"
          icon={<ListMusic className="w-4 h-4" />}
        />
      </div>
    </header>
  );
};
