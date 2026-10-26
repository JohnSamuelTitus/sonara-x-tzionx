import React, { useState, useEffect } from 'react';
import { PlayerProvider } from './context/PlayerContext';
import { MainLayout } from './components/layout/MainLayout';
import { MobileLockoutView } from './components/common/MobileLockoutView';
import { isMobileDevice } from './utils/deviceGuard';

export const App: React.FC = () => {
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return isMobileDevice();
    }
    return false;
  });

  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(isMobileDevice());
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    window.addEventListener('orientationchange', checkDevice);
    return () => {
      window.removeEventListener('resize', checkDevice);
      window.removeEventListener('orientationchange', checkDevice);
    };
  }, []);

  if (isMobile) {
    return (
      <MobileLockoutView
        onBypass={() => {
          try {
            sessionStorage.setItem('tzx_mobile_bypass', 'true');
          } catch {}
          setIsMobile(false);
        }}
      />
    );
  }

  return (
    <PlayerProvider>
      <MainLayout />
    </PlayerProvider>
  );
};

export default App;
