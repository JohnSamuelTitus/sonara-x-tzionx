// ==============================================================================
// SONARA X TZIONX — PWA CONTROLLER & INSTALL MANAGER
// ==============================================================================
// Manages:
// • Service Worker registration, updates & graceful cache refresh
// • Standalone mode detection (PWA window vs browser tab)
// • Native beforeinstallprompt capture & dismissal cooldown
// • iOS Safari manual Add to Home Screen guidance detection
// • Live connectivity tracking (online / offline)
// ==============================================================================

import { useState, useEffect, useCallback } from 'react';

export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

const DISMISS_KEY = 'sonara_pwa_install_dismissed_until';
const DISMISS_COOLDOWN_MS = 3 * 24 * 60 * 60 * 1000; // 3 days cooldown after dismissal

let globalDeferredPrompt: BeforeInstallPromptEvent | null = null;
const listeners = new Set<() => void>();

function notifyListeners() {
  listeners.forEach((listener) => listener());
}

// Global beforeinstallprompt listener setup
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e: Event) => {
    e.preventDefault();
    globalDeferredPrompt = e as BeforeInstallPromptEvent;
    notifyListeners();
  });

  window.addEventListener('appinstalled', () => {
    globalDeferredPrompt = null;
    notifyListeners();
    console.log('[Sonara PWA] Application successfully installed.');
  });
}

/** Check if running inside installed standalone PWA window */
export function isRunningStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  const hasMatchMedia = typeof window.matchMedia === 'function';
  return Boolean(
    (hasMatchMedia && (window.matchMedia('(display-mode: standalone)').matches || window.matchMedia('(display-mode: fullscreen)').matches)) ||
    (window.navigator as any)?.standalone === true ||
    (typeof document !== 'undefined' && document.referrer?.includes('android-app://'))
  );
}

/** Check if running on iOS (where install prompt is manual via Safari Share menu) */
export function isIosDevice(): boolean {
  if (typeof window === 'undefined') return false;
  const ua = window.navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(ua) && !(window as any).MSStream;
}

/** Check if browser is Safari on iOS */
export function isIosSafari(): boolean {
  if (typeof window === 'undefined') return false;
  const ua = window.navigator.userAgent.toLowerCase();
  return isIosDevice() && /safari/.test(ua) && !/crios|fxios|opios|mercury/.test(ua);
}

/** Check if user previously dismissed prompt and cooldown has not expired */
export function isDismissCooldownActive(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const raw = localStorage.getItem(DISMISS_KEY);
    if (!raw) return false;
    const until = parseInt(raw, 10);
    return Date.now() < until;
  } catch {
    return false;
  }
}

/** Register Service Worker with safe update detection */
export function registerServiceWorker(onUpdate?: (registration: ServiceWorkerRegistration) => void) {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('[Sonara SW] Registered with scope:', registration.scope);

        // Check if an updated worker is already waiting
        if (registration.waiting && onUpdate) {
          onUpdate(registration);
        }

        // Listen for new workers being installed
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (!newWorker) return;

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New content is available and waiting
              console.log('[Sonara SW] New version available for Sonara.');
              if (onUpdate) onUpdate(registration);
            }
          });
        });
      })
      .catch((err) => {
        console.warn('[Sonara SW] Registration failed:', err);
      });
  });
}

/** Hook for PWA state and install management across components */
export function usePwa() {
  const [isStandalone, setIsStandalone] = useState(() => isRunningStandalone());
  const [isOnline, setIsOnline] = useState(() => (typeof navigator !== 'undefined' ? navigator.onLine : true));
  const [canPromptInstall, setCanPromptInstall] = useState(() => Boolean(globalDeferredPrompt) && !isDismissCooldownActive());
  const [isInstalled, setIsInstalled] = useState(false);
  const [hasUpdate, setHasUpdate] = useState(false);
  const [waitingRegistration, setWaitingRegistration] = useState<ServiceWorkerRegistration | null>(null);

  // Sync state with global listener
  useEffect(() => {
    const updateState = () => {
      const standalone = isRunningStandalone();
      setIsStandalone(standalone);
      setCanPromptInstall(Boolean(globalDeferredPrompt) && !isDismissCooldownActive() && !standalone);
    };

    listeners.add(updateState);
    updateState();

    // Online / Offline listeners
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Register Service Worker
    registerServiceWorker((reg) => {
      setHasUpdate(true);
      setWaitingRegistration(reg);
    });

    return () => {
      listeners.delete(updateState);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Trigger browser's native install prompt
  const promptInstall = useCallback(async (): Promise<'accepted' | 'dismissed' | 'unavailable'> => {
    if (!globalDeferredPrompt) {
      return 'unavailable';
    }

    try {
      const promptEvent = globalDeferredPrompt;
      await promptEvent.prompt();
      const choice = await promptEvent.userChoice;

      if (choice.outcome === 'accepted') {
        globalDeferredPrompt = null;
        setCanPromptInstall(false);
        setIsInstalled(true);
        notifyListeners();
        return 'accepted';
      } else {
        // User dismissed: record cooldown to avoid nagging
        localStorage.setItem(DISMISS_KEY, (Date.now() + DISMISS_COOLDOWN_MS).toString());
        setCanPromptInstall(false);
        notifyListeners();
        return 'dismissed';
      }
    } catch (err) {
      console.warn('[Sonara PWA] Error invoking install prompt:', err);
      return 'unavailable';
    }
  }, []);

  // User explicitly dismisses install notification
  const dismissInstall = useCallback(() => {
    try {
      localStorage.setItem(DISMISS_KEY, (Date.now() + DISMISS_COOLDOWN_MS).toString());
    } catch {}
    setCanPromptInstall(false);
  }, []);

  // Apply service worker update safely
  const applyUpdate = useCallback(() => {
    if (waitingRegistration?.waiting) {
      waitingRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
    // Reload to load new cached assets
    window.location.reload();
  }, [waitingRegistration]);

  return {
    isStandalone,
    isOnline,
    canPromptInstall,
    isInstalled,
    isIos: isIosDevice(),
    isIosSafari: isIosSafari(),
    hasUpdate,
    promptInstall,
    dismissInstall,
    applyUpdate,
  };
}
