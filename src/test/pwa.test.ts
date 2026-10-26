import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';
import {
  isRunningStandalone,
  isDismissCooldownActive,
  isIosDevice,
  isIosSafari,
} from '../utils/pwa';

describe('PWA Manifest & Configuration', () => {
  const manifestPath = path.resolve(__dirname, '../../public/manifest.webmanifest');
  const manifestJsonPath = path.resolve(__dirname, '../../public/manifest.json');

  it('provides a valid manifest.webmanifest with correct Sonara metadata', () => {
    expect(fs.existsSync(manifestPath)).toBe(true);
    const content = fs.readFileSync(manifestPath, 'utf-8');
    const manifest = JSON.parse(content);

    expect(manifest.name).toBe('sonara X TzionX');
    expect(manifest.short_name).toBe('Sonara');
    expect(manifest.start_url).toBe('/');
    expect(manifest.scope).toBe('/');
    expect(manifest.display).toBe('standalone');
    expect(manifest.orientation).toBe('portrait-primary');
    expect(manifest.background_color).toBe('#0A0809');
    expect(manifest.theme_color).toBe('#0A0809');
    expect(manifest.categories).toContain('music');
  });

  it('serves an identical manifest.json for backward compatibility', () => {
    expect(fs.existsSync(manifestJsonPath)).toBe(true);
    const webmanifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    const json = JSON.parse(fs.readFileSync(manifestJsonPath, 'utf-8'));
    expect(json.name).toBe(webmanifest.name);
    expect(json.short_name).toBe(webmanifest.short_name);
    expect(json.display).toBe(webmanifest.display);
  });

  it('contains valid icons in required sizes including maskable purpose', () => {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    const icons = manifest.icons;
    expect(icons.length).toBeGreaterThanOrEqual(4);

    const has192 = icons.some((i: any) => i.sizes === '192x192' && i.type === 'image/png');
    const has512 = icons.some((i: any) => i.sizes === '512x512' && i.type === 'image/png');
    const hasMaskable192 = icons.some((i: any) => i.sizes === '192x192' && i.purpose === 'maskable');
    const hasMaskable512 = icons.some((i: any) => i.sizes === '512x512' && i.purpose === 'maskable');

    expect(has192).toBe(true);
    expect(has512).toBe(true);
    expect(hasMaskable192).toBe(true);
    expect(hasMaskable512).toBe(true);
  });

  it('ensures all referenced icon files physically exist on disk and have valid PNG headers', () => {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    const pngMagic = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]); // \x89PNG\r\n\x1a\n

    manifest.icons.forEach((icon: any) => {
      const iconDiskPath = path.resolve(__dirname, '../../public', icon.src.replace(/^\//, ''));
      expect(fs.existsSync(iconDiskPath)).toBe(true);
      const stat = fs.statSync(iconDiskPath);
      expect(stat.size).toBeGreaterThan(100);

      if (icon.type === 'image/png') {
        const fileBuf = fs.readFileSync(iconDiskPath);
        expect(fileBuf.subarray(0, 8)).toEqual(pngMagic);
      }
    });

    // Also check apple-touch-icon
    const appleIconPath = path.resolve(__dirname, '../../public/icons/apple-touch-icon.png');
    expect(fs.existsSync(appleIconPath)).toBe(true);
    expect(fs.readFileSync(appleIconPath).subarray(0, 8)).toEqual(pngMagic);
  });
});

describe('Service Worker Strategy & Safety', () => {
  const swPath = path.resolve(__dirname, '../../public/sw.js');

  it('serves a valid service worker file', () => {
    expect(fs.existsSync(swPath)).toBe(true);
    const swContent = fs.readFileSync(swPath, 'utf-8');

    // Versioned cache name
    expect(swContent).toMatch(/CACHE_VERSION\s*=\s*['"]sonara-v1-shell['"]/);

    // Precaches app shell
    expect(swContent).toContain('/manifest.webmanifest');
    expect(swContent).toContain('/index.html');

    // Never caches arbitrary third-party streaming media
    expect(swContent).toContain('youtube.com');
    expect(swContent).toContain('googlevideo.com');

    // Network-only for live music search API
    expect(swContent).toContain('/api/youtube/');
    expect(swContent).toContain('OFFLINE');
  });
});

describe('PWA Install Manager & Utilities', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('detects browser tab vs standalone window mode', () => {
    // In standard test environment, matchMedia returns false
    expect(isRunningStandalone()).toBe(false);

    // Mock matchMedia returning standalone
    const originalMatchMedia = window.matchMedia;
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: query.includes('standalone'),
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    expect(isRunningStandalone()).toBe(true);
    window.matchMedia = originalMatchMedia;
  });

  it('handles dismissal cooldown without repeatedly nagging the user', () => {
    expect(isDismissCooldownActive()).toBe(false);

    // Set cooldown in future
    localStorage.setItem('sonara_pwa_install_dismissed_until', (Date.now() + 100000).toString());
    expect(isDismissCooldownActive()).toBe(true);

    // Expired cooldown
    localStorage.setItem('sonara_pwa_install_dismissed_until', (Date.now() - 1000).toString());
    expect(isDismissCooldownActive()).toBe(false);
  });

  it('correctly distinguishes iOS devices for manual install guidance', () => {
    const originalUserAgent = navigator.userAgent;

    // Simulate iPhone
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1',
      configurable: true,
    });
    expect(isIosDevice()).toBe(true);
    expect(isIosSafari()).toBe(true);

    // Simulate Android Chrome
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 Chrome/114.0.0.0 Mobile Safari/537.36',
      configurable: true,
    });
    expect(isIosDevice()).toBe(false);
    expect(isIosSafari()).toBe(false);

    // Reset user agent
    Object.defineProperty(navigator, 'userAgent', {
      value: originalUserAgent,
      configurable: true,
    });
  });
});
