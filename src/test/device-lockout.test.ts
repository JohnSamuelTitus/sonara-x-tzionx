import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { isMobileOrTabletDevice } from '../utils/deviceGuard';
import { MobileAnnouncementView } from '../components/common/MobileAnnouncementView';
import { App } from '../App';

describe('Mobile Under Development Announcement & Device Detection', () => {
  const originalUserAgent = navigator.userAgent;
  const originalPlatform = navigator.platform;
  const originalMaxTouchPoints = navigator.maxTouchPoints;
  const originalScreen = { ...window.screen };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    Object.defineProperty(navigator, 'userAgent', {
      value: originalUserAgent,
      configurable: true,
      writable: true,
    });
    Object.defineProperty(navigator, 'platform', {
      value: originalPlatform,
      configurable: true,
      writable: true,
    });
    Object.defineProperty(navigator, 'maxTouchPoints', {
      value: originalMaxTouchPoints,
      configurable: true,
      writable: true,
    });
    Object.defineProperty(window, 'screen', {
      value: originalScreen,
      configurable: true,
      writable: true,
    });
  });

  it('renders exact requested announcement copy and brand in MobileAnnouncementView', () => {
    const html = renderToString(React.createElement(MobileAnnouncementView));

    // 1. Brand check
    expect(html).toContain('Sonara');
    expect(html).toContain('TzionX');

    // 2. Status label check
    expect(html).toContain('MOBILE VERSION · UNDER DEVELOPMENT');

    // 3. Heading check
    expect(html).toContain('Our Mobile Experience Is Coming Soon');

    // 4. Exact message copy check
    expect(html).toContain(
      'We’re working hard to bring you a beautiful, smooth, and complete Sonara experience on mobile. Our mobile version is currently under development, and we’re making improvements to deliver the best possible listening experience. Thank you for your patience and for being part of our journey.'
    );

    // 5. Exact closing line check
    expect(html).toContain('Made with passion by TzionX and its team.');
  });

  it('detects iPhone mobile devices', () => {
    Object.defineProperty(navigator, 'userAgent', {
      value:
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
      configurable: true,
      writable: true,
    });
    Object.defineProperty(navigator, 'maxTouchPoints', { value: 5, configurable: true, writable: true });
    Object.defineProperty(window, 'screen', {
      value: { width: 390, height: 844 },
      configurable: true,
      writable: true,
    });

    expect(isMobileOrTabletDevice()).toBe(true);
  });

  it('detects Android mobile devices', () => {
    Object.defineProperty(navigator, 'userAgent', {
      value:
        'Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.144 Mobile Safari/537.36',
      configurable: true,
      writable: true,
    });
    Object.defineProperty(navigator, 'maxTouchPoints', { value: 5, configurable: true, writable: true });
    Object.defineProperty(window, 'screen', {
      value: { width: 412, height: 915 },
      configurable: true,
      writable: true,
    });

    expect(isMobileOrTabletDevice()).toBe(true);
  });

  it('detects Samsung Galaxy Tab A7 and Android tablets', () => {
    Object.defineProperty(navigator, 'userAgent', {
      value:
        'Mozilla/5.0 (Linux; Android 12; SM-T500) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
      configurable: true,
      writable: true,
    });
    Object.defineProperty(navigator, 'maxTouchPoints', { value: 10, configurable: true, writable: true });
    Object.defineProperty(window, 'screen', {
      value: { width: 800, height: 1334 },
      configurable: true,
      writable: true,
    });

    expect(isMobileOrTabletDevice()).toBe(true);
  });

  it('detects iPadOS tablets (MacIntel with touch points)', () => {
    Object.defineProperty(navigator, 'userAgent', {
      value:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
      configurable: true,
      writable: true,
    });
    Object.defineProperty(navigator, 'platform', { value: 'MacIntel', configurable: true, writable: true });
    Object.defineProperty(navigator, 'maxTouchPoints', { value: 5, configurable: true, writable: true });
    Object.defineProperty(window, 'screen', {
      value: { width: 820, height: 1180 },
      configurable: true,
      writable: true,
    });

    expect(isMobileOrTabletDevice()).toBe(true);
  });

  it('allows Windows PC / Laptop when screen monitor is desktop size', () => {
    Object.defineProperty(navigator, 'userAgent', {
      value:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      configurable: true,
      writable: true,
    });
    Object.defineProperty(navigator, 'platform', { value: 'Win32', configurable: true, writable: true });
    Object.defineProperty(navigator, 'maxTouchPoints', { value: 0, configurable: true, writable: true });
    Object.defineProperty(window, 'screen', {
      value: { width: 1920, height: 1080 },
      configurable: true,
      writable: true,
    });

    // Mock fine mouse pointer with hover support
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: query.includes('pointer: fine') || query.includes('hover: hover'),
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    expect(isMobileOrTabletDevice()).toBe(false);
  });

  it('preserves desktop/laptop access even when browser window is resized to small mobile width', () => {
    // Desktop user resized browser window down to 360px
    Object.defineProperty(navigator, 'userAgent', {
      value:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
      configurable: true,
      writable: true,
    });
    Object.defineProperty(navigator, 'maxTouchPoints', { value: 0, configurable: true, writable: true });
    Object.defineProperty(window, 'innerWidth', { value: 360, configurable: true, writable: true });
    // Physical hardware monitor remains standard 1920x1080
    Object.defineProperty(window, 'screen', {
      value: { width: 1920, height: 1080 },
      configurable: true,
      writable: true,
    });

    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: query.includes('pointer: fine') || query.includes('hover: hover'),
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    expect(isMobileOrTabletDevice()).toBe(false);
  });

  it('renders MobileAnnouncementView on mobile devices at application entry point', () => {
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Mobile/15E148 Safari/604.1',
      configurable: true,
      writable: true,
    });
    Object.defineProperty(navigator, 'maxTouchPoints', { value: 5, configurable: true, writable: true });
    Object.defineProperty(window, 'screen', {
      value: { width: 390, height: 844 },
      configurable: true,
      writable: true,
    });

    const html = renderToString(React.createElement(App));
    expect(html).toContain('Our Mobile Experience Is Coming Soon');
    expect(html).toContain('MOBILE VERSION · UNDER DEVELOPMENT');
    // Main player layout should NOT be rendered behind announcement:
    expect(html).not.toContain('id="sonora-youtube-player-iframe"');
  });
});
