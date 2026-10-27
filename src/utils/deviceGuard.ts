import { useState, useEffect } from 'react';

/**
 * Utility to identify mobile phones and tablets using responsive viewport,
 * touch capabilities, and device characteristics, while ensuring desktop
 * and laptop computers access the application normally—even when resizing
 * the browser window.
 */

export function isMobileOrTabletDevice(): boolean {
  if (typeof window === 'undefined') return false;

  // Optional URL parameter for manual test bypass: ?bypass_mobile=1
  try {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('bypass_mobile') === '1' || urlParams.get('desktop') === '1') {
      return false;
    }
  } catch {
    // Ignore URL parse errors
  }

  const ua = navigator.userAgent || '';
  const platform = navigator.platform || '';
  const maxTouchPoints = navigator.maxTouchPoints || 0;

  // 1. Mobile Phone User-Agent Signatures
  const isMobilePhoneUa =
    /iPhone|iPod|Windows Phone|BlackBerry|BB10|IEMobile|Opera Mini|Android.*Mobile|Mobile.*Firefox/i.test(
      ua
    );

  // 2. Tablet User-Agent Signatures
  // - Android tablets have "Android" without "Mobile", or specific model tokens like SM-T (Galaxy Tab A7 / S series)
  // - iPads report "iPad", or on modern iPadOS report "MacIntel" with multiple touch points (maxTouchPoints > 1)
  // - Silk / Kindle / PlayBook
  const isAndroidTablet = /Android/i.test(ua) && !/Mobile/i.test(ua);
  const isSamsungTabModel = /SM-T|GT-P|GT-N|Tab[ \-_A-Za-z0-9]/i.test(ua);
  const isLegacyIpad = /iPad/i.test(ua);
  const isModernIpadOS =
    platform === 'MacIntel' && maxTouchPoints > 1 && !/iPhone/i.test(ua);
  const isOtherTablet = /Tablet|PlayBook|Silk|Kindle/i.test(ua);

  const isTabletUa =
    isAndroidTablet || isSamsungTabModel || isLegacyIpad || isModernIpadOS || isOtherTablet;

  // 3. Client Hints mobile flag (Chromium Android phones and tablets)
  const uaData = (navigator as any).userAgentData;
  const isUaDataMobile = uaData?.mobile === true;

  // 4. Pointer & Hover capabilities
  const hasFinePointer =
    typeof window.matchMedia === 'function'
      ? window.matchMedia('(pointer: fine)').matches
      : false;
  const hasCoarsePointer =
    typeof window.matchMedia === 'function'
      ? window.matchMedia('(pointer: coarse)').matches
      : false;
  const hasNoHover =
    typeof window.matchMedia === 'function'
      ? window.matchMedia('(hover: none)').matches
      : false;

  // 5. Hardware Monitor Screen Size
  // On desktop PCs and laptops, window.screen.width and window.screen.height represent
  // the physical monitor resolution (e.g. 1920x1080, 1440x900).
  // When a PC user resizes the browser window to 360px, window.innerWidth changes,
  // but window.screen.width stays 1920px!
  const screenMinDimension = Math.min(
    window.screen?.width || 0,
    window.screen?.height || 0
  );

  // Desktop / Laptop Exemption:
  // If the device has fine mouse pointer, hover capability, NO mobile/tablet UA,
  // and physical monitor dimension >= 1024px, it is definitely a PC or Laptop.
  if (
    hasFinePointer &&
    !hasNoHover &&
    !isMobilePhoneUa &&
    !isTabletUa &&
    !isUaDataMobile &&
    screenMinDimension >= 1024
  ) {
    return false;
  }

  // If UA explicitly matches a mobile phone:
  if (isMobilePhoneUa) {
    return true;
  }

  // If UA explicitly matches a tablet:
  if (isTabletUa) {
    return true;
  }

  // If Client Hints indicates mobile:
  if (isUaDataMobile) {
    return true;
  }

  // Touch device check: coarse pointer, no hover capability, and touch points:
  const isTouchDevice = maxTouchPoints > 0 && hasCoarsePointer && hasNoHover;
  if (isTouchDevice) {
    // If physical screen dimension is typical of phones/tablets (< 1024px)
    if (screenMinDimension > 0 && screenMinDimension < 1024) {
      return true;
    }
  }

  return false;
}

// Backwards-compatible alias for existing imports
export const isMobileDevice = isMobileOrTabletDevice;

/**
 * React hook to reactively track mobile/tablet device status on resize or orientation change.
 */
export function useIsMobileOrTablet(): boolean {
  const [isMobile, setIsMobile] = useState<boolean>(() => isMobileOrTabletDevice());

  useEffect(() => {
    const check = () => {
      setIsMobile(isMobileOrTabletDevice());
    };

    window.addEventListener('resize', check);
    window.addEventListener('orientationchange', check);
    return () => {
      window.removeEventListener('resize', check);
      window.removeEventListener('orientationchange', check);
    };
  }, []);

  return isMobile;
}
