import React from 'react';
import { Home, Search, Heart, Menu, ListMusic } from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';

interface BottomNavProps {
  onOpenMobileMenu: () => void;
  isMobileMenuOpen: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({ onOpenMobileMenu, isMobileMenuOpen }) => {
  const {
    activeView,
    setActiveView,
    selectedPlaylistId,
    selectPlaylist,
  } = usePlayer();

  const isHomeActive = activeView === 'home' && !selectedPlaylistId;
  const isSearchActive = activeView === 'search';
  const isLibraryActive = selectedPlaylistId === 'special-liked' || selectedPlaylistId === 'special-recent';
  const isPlaylistsActive = activeView === 'playlist' && !isLibraryActive;

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-[#080608] via-[#100C0F] to-[#140F13] border-t border-cinema-gold/25 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-8px_24px_rgba(0,0,0,0.8)] backdrop-blur-lg select-none"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {/* 1. Home */}
        <button
          type="button"
          onClick={() => setActiveView('home')}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] py-1 px-2 rounded-xl transition-all ${
            isHomeActive
              ? 'text-cinema-gold font-bold scale-105'
              : 'text-cinema-ivoryMuted hover:text-cinema-ivory'
          }`}
          aria-label="Cinema Home"
          aria-current={isHomeActive ? 'page' : undefined}
        >
          <div className="relative">
            <Home className="w-5 h-5" />
            {isHomeActive && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-cinema-gold shadow-[0_0_6px_#D4AF37]" />
            )}
          </div>
          <span className="text-[10px] font-sans tracking-wide mt-1">Home</span>
        </button>

        {/* 2. Search */}
        <button
          type="button"
          onClick={() => setActiveView('search')}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] py-1 px-2 rounded-xl transition-all ${
            isSearchActive
              ? 'text-cinema-gold font-bold scale-105'
              : 'text-cinema-ivoryMuted hover:text-cinema-ivory'
          }`}
          aria-label="Search tracks"
          aria-current={isSearchActive ? 'page' : undefined}
        >
          <div className="relative">
            <Search className="w-5 h-5" />
            {isSearchActive && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-cinema-gold shadow-[0_0_6px_#D4AF37]" />
            )}
          </div>
          <span className="text-[10px] font-sans tracking-wide mt-1">Search</span>
        </button>

        {/* 3. Library / Liked */}
        <button
          type="button"
          onClick={() => selectPlaylist('special-liked')}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] py-1 px-2 rounded-xl transition-all ${
            isLibraryActive
              ? 'text-cinema-gold font-bold scale-105'
              : 'text-cinema-ivoryMuted hover:text-cinema-ivory'
          }`}
          aria-label="Library"
          aria-current={isLibraryActive ? 'page' : undefined}
        >
          <div className="relative">
            <Heart className={`w-5 h-5 ${isLibraryActive ? 'fill-cinema-vermilion text-cinema-vermilion' : ''}`} />
            {isLibraryActive && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-cinema-gold shadow-[0_0_6px_#D4AF37]" />
            )}
          </div>
          <span className="text-[10px] font-sans tracking-wide mt-1">Library</span>
        </button>

        {/* 4. Playlists */}
        <button
          type="button"
          onClick={() => {
            selectPlaylist('pl-1');
          }}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] py-1 px-2 rounded-xl transition-all ${
            isPlaylistsActive
              ? 'text-cinema-gold font-bold scale-105'
              : 'text-cinema-ivoryMuted hover:text-cinema-ivory'
          }`}
          aria-label="Playlists"
          aria-current={isPlaylistsActive ? 'page' : undefined}
        >
          <div className="relative">
            <ListMusic className="w-5 h-5" />
            {isPlaylistsActive && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-cinema-gold shadow-[0_0_6px_#D4AF37]" />
            )}
          </div>
          <span className="text-[10px] font-sans tracking-wide mt-1">Playlists</span>
        </button>

        {/* 5. Menu Drawer Toggle */}
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] py-1 px-2 rounded-xl transition-all ${
            isMobileMenuOpen
              ? 'text-cinema-gold font-bold'
              : 'text-cinema-ivoryMuted hover:text-cinema-ivory'
          }`}
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
          <span className="text-[10px] font-sans tracking-wide mt-1">Menu</span>
        </button>
      </div>
    </nav>
  );
};
