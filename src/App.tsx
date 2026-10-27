import React from 'react';
import { PlayerProvider } from './context/PlayerContext';
import { MainLayout } from './components/layout/MainLayout';

export const App: React.FC = () => {
  return (
    <PlayerProvider>
      <MainLayout />
    </PlayerProvider>
  );
};

export default App;
