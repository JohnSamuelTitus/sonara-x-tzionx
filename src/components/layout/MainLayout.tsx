import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { BottomNav } from './BottomNav';
import { MobileNavDrawer } from './MobileNavDrawer';
import { PlayerBar } from '../player/PlayerBar';
import { MobileMiniPlayer } from '../player/MobileMiniPlayer';
import { HomeView } from '../views/HomeView';
import { SearchView } from '../views/SearchView';
import { PlaylistView } from '../views/PlaylistView';
import { CategoryView } from '../views/CategoryView';
import { QueueDrawer } from '../views/QueueDrawer';
import { YouTubePlayerSurface } from '../player/YouTubePlayerSurface';
import { InstallModal } from '../common/InstallModal';
import { OfflineBanner } from '../common/OfflineBanner';
import { UpdateBanner } from '../common/UpdateBanner';
import { usePlayer } from '../../context/PlayerContext';
import { usePwa } from '../../utils/pwa';

export const MainLayout: React.FC = () => {
  const { activeView } = usePlayer();
  const pwa = usePwa();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-cinema-bg text-cinema-ivory">
      {/* 1. Global Network & PWA Update Banners */}
      <OfflineBanner isOnline={pwa.isOnline} />
      <UpdateBanner hasUpdate={pwa.hasUpdate} onApplyUpdate={pwa.applyUpdate} />

      {/* 2. Upper Section: Sidebar + Main Content Area */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Sidebar Navigation (Desktop & Tablet) */}
        <Sidebar
          onOpenInstallModal={() => setIsInstallModalOpen(true)}
          isStandalone={pwa.isStandalone}
        />

        {/* Right Content Area */}
        <div className="flex flex-col flex-1 overflow-hidden bg-gradient-to-b from-cinema-surface to-cinema-bg min-w-0">
          <TopBar
            onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
            onOpenInstallModal={() => setIsInstallModalOpen(true)}
            isStandalone={pwa.isStandalone}
          />

          {/* Dynamic Content View Container with Responsive Safe Area Padding */}
          <main
            className="flex-1 overflow-y-auto overflow-x-hidden px-3 sm:px-6 py-4 sm:py-6 pb-[calc(9.5rem+env(safe-area-inset-bottom))] md:pb-20 focus:outline-none"
            tabIndex={-1}
          >
            <div className="max-w-[1600px] w-full mx-auto min-h-full">
              {activeView === 'home' && <HomeView />}
              {activeView === 'search' && <SearchView />}
              {activeView === 'playlist' && <PlaylistView />}
              {activeView === 'category' && <CategoryView />}
            </div>

            {/* Exact Required Attribution Footer — Section 8 */}
            <footer className="mt-10 sm:mt-14 pt-6 pb-12 sm:pb-16 border-t border-cinema-border/30 text-center select-none">
              <p className="text-xs text-cinema-ivoryMuted/60 font-mono tracking-wider">
                A product of TzionX and its team
              </p>
            </footer>
          </main>
        </div>

        {/* Up Next Queue Slide-over Drawer */}
        <QueueDrawer />

        {/* Persistent YouTube Player Video Surface */}
        <YouTubePlayerSurface />
      </div>

      {/* 3. Mobile Player & Navigation Systems (Phones & Compact Screens < 768px) */}
      <MobileMiniPlayer />
      <BottomNav
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        isMobileMenuOpen={isMobileMenuOpen}
      />
      <MobileNavDrawer
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        onOpenInstallModal={() => setIsInstallModalOpen(true)}
        isStandalone={pwa.isStandalone}
      />

      {/* 4. Desktop Persistent Bottom Playback Bar (>= 768px) */}
      <PlayerBar />

      {/* 5. Install Guidance Dialog */}
      <InstallModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
        onInstallNative={pwa.promptInstall}
        canPromptNative={pwa.canPromptInstall}
        isIos={pwa.isIos}
      />
    </div>
  );
};

export default MainLayout;
