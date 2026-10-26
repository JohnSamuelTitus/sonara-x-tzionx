import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { isMobileDevice } from '../utils/deviceGuard';
import { MobileLockoutView } from '../components/common/MobileLockoutView';

describe('Device Lockout Guard & Mobile Restriction', () => {
  const originalUserAgent = navigator.userAgent;
  const originalScreen = { ...window.screen };

  beforeEach(() => {
    vi.restoreAllMocks();
    sessionStorage.clear();
  });

  afterEach(() => {
    Object.defineProperty(navigator, 'userAgent', {
      value: originalUserAgent,
      configurable: true,
      writable: true,
    });
    Object.defineProperty(window, 'screen', {
      value: originalScreen,
      configurable: true,
      writable: true,
    });
  });

  it('renders exact requested lockout message in MobileLockoutView', () => {
    const html = renderToString(React.createElement(MobileLockoutView));
    
    // Exact user requirement text check:
    expect(html).toContain(
      "We&#x27;re working on a mobile version! For the best experience, please open this on your laptop or PC"
    );
    expect(html).toContain('Big Screens, Laptops &amp; PC Only');
    expect(html).toContain('A product of TzionX and its team');
    expect(html).toContain('Sonara');
  });

  it('allows PC / Laptop when screen monitor is >= 768px (standard desktop)', () => {
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      configurable: true,
      writable: true,
    });
    Object.defineProperty(window, 'screen', {
      value: { width: 1920, height: 1080 },
      configurable: true,
      writable: true,
    });

    expect(isMobileDevice()).toBe(false);
  });

  it('preserves desktop/laptop access even when browser window is resized to small mobile width', () => {
    // Desktop user resized browser window down to 360px (split screen / window snapping)
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
      configurable: true,
      writable: true,
    });
    Object.defineProperty(window, 'innerWidth', { value: 360, configurable: true, writable: true });
    // But physical screen resolution remains 1920x1080 (the monitor!)
    Object.defineProperty(window, 'screen', {
      value: { width: 1920, height: 1080 },
      configurable: true,
      writable: true,
    });

    expect(isMobileDevice()).toBe(false);
  });

  it('locks out iPhone mobile devices', () => {
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
      configurable: true,
      writable: true,
    });
    Object.defineProperty(window, 'screen', {
      value: { width: 390, height: 844 },
      configurable: true,
      writable: true,
    });

    expect(isMobileDevice()).toBe(true);
  });

  it('locks out Android mobile devices', () => {
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.144 Mobile Safari/537.36',
      configurable: true,
      writable: true,
    });
    Object.defineProperty(window, 'screen', {
      value: { width: 412, height: 915 },
      configurable: true,
      writable: true,
    });

    expect(isMobileDevice()).toBe(true);
  });

  it('allows bypass when session storage bypass flag is set for testing/development', () => {
    sessionStorage.setItem('tzx_mobile_bypass', 'true');
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Mobile/15E148 Safari/604.1',
      configurable: true,
      writable: true,
    });

    expect(isMobileDevice()).toBe(false);
  });
});
