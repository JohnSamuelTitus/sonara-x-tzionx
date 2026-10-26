import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { BottomNav } from '../components/layout/BottomNav';
import { MobileNavDrawer } from '../components/layout/MobileNavDrawer';
import { OfflineBanner } from '../components/common/OfflineBanner';
import { UpdateBanner } from '../components/common/UpdateBanner';
import { InstallModal } from '../components/common/InstallModal';
import { PlayerProvider } from '../context/PlayerContext';

describe('Responsive Components & PWA Layout Systems', () => {
  it('renders BottomNav with all 5 mobile destinations and accessible ARIA labels', () => {
    const html = renderToString(
      React.createElement(
        PlayerProvider,
        null,
        React.createElement(BottomNav, {
          onOpenMobileMenu: () => {},
          isMobileMenuOpen: false,
        })
      )
    );

    expect(html).toContain('aria-label="Mobile Navigation"');
    expect(html).toContain('aria-label="Cinema Home"');
    expect(html).toContain('aria-label="Search tracks"');
    expect(html).toContain('aria-label="Library"');
    expect(html).toContain('aria-label="Playlists"');
    expect(html).toContain('aria-label="Toggle navigation menu"');
    expect(html).toContain('Home');
    expect(html).toContain('Search');
    expect(html).toContain('Library');
    expect(html).toContain('Playlists');
    expect(html).toContain('Menu');
  });

  it('renders MobileNavDrawer with brand identity, playlists, and PWA install trigger', () => {
    const html = renderToString(
      React.createElement(
        PlayerProvider,
        null,
        React.createElement(MobileNavDrawer, {
          isOpen: true,
          onClose: () => {},
          onOpenInstallModal: () => {},
          isStandalone: false,
        })
      )
    );

    expect(html).toContain('Sunara');
    expect(html).toContain('X TzionX');
    expect(html).toContain('luxury made affordable');
    expect(html).toContain('Install Sonara App');
    expect(html).toContain('A product of TzionX and its team');
    expect(html).toContain('Your Cinema Library');
    expect(html).toContain('Vault Playlists');
  });

  it('hides install button in MobileNavDrawer when already running in standalone mode', () => {
    const html = renderToString(
      React.createElement(
        PlayerProvider,
        null,
        React.createElement(MobileNavDrawer, {
          isOpen: true,
          onClose: () => {},
          onOpenInstallModal: () => {},
          isStandalone: true,
        })
      )
    );

    expect(html).not.toContain('Install Sonara App');
  });

  it('renders OfflineBanner only when offline and hides when online', () => {
    const onlineHtml = renderToString(
      React.createElement(OfflineBanner, {
        isOnline: true,
        onRetry: () => {},
      })
    );
    expect(onlineHtml).toBe('');

    const offlineHtml = renderToString(
      React.createElement(OfflineBanner, {
        isOnline: false,
        onRetry: () => {},
      })
    );
    expect(offlineHtml).toContain('role="alert"');
    expect(offlineHtml).toContain('Offline Mode:');
    expect(offlineHtml).toContain('Internet connection lost');
    expect(offlineHtml).toContain('Retry');
  });

  it('renders UpdateBanner only when update is available', () => {
    const noUpdateHtml = renderToString(
      React.createElement(UpdateBanner, {
        hasUpdate: false,
        onApplyUpdate: () => {},
      })
    );
    expect(noUpdateHtml).toBe('');

    const updateHtml = renderToString(
      React.createElement(UpdateBanner, {
        hasUpdate: true,
        onApplyUpdate: () => {},
      })
    );
    expect(updateHtml).toContain('role="status"');
    expect(updateHtml).toContain('Update Ready:');
    expect(updateHtml).toContain('Refresh');
  });

  it('renders InstallModal with native install button when canPromptNative is true', () => {
    const html = renderToString(
      React.createElement(InstallModal, {
        isOpen: true,
        onClose: () => {},
        onInstallNative: () => {},
        canPromptNative: true,
        isIos: false,
      })
    );

    expect(html).toContain('Install Sonara');
    expect(html).toContain('Install Now');
    expect(html).toContain('Standalone Cinema Audio Experience');
  });

  it('renders InstallModal with iOS Safari manual installation guidance when on iOS', () => {
    const html = renderToString(
      React.createElement(InstallModal, {
        isOpen: true,
        onClose: () => {},
        canPromptNative: false,
        isIos: true,
      })
    );

    expect(html).toContain('To install Sonara on your iPhone or iPad:');
    expect(html).toContain('Add to Home Screen');
    expect(html).toContain('Safari');
  });
});
