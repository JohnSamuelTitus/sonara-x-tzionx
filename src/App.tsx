import React from 'react';
import { PlayerProvider } from './context/PlayerContext';
import { MainLayout } from './components/layout/MainLayout';
import { MobileAnnouncementView } from './components/common/MobileAnnouncementView';
import { useIsMobileOrTablet } from './utils/deviceGuard';

export const App: React.FC = () => {
  const isMobile = useIsMobileOrTablet();

  if (isMobile) {
    return <MobileAnnouncementView />;
  }

  return (
    <PlayerProvider>
      <MainLayout />
    </PlayerProvider>
  );
};

export default App;
