/**
 * Utility to identify mobile handheld devices (smartphones)
 * while ensuring laptops, PCs, and desktop monitors remain completely unlocked,
 * EVEN WHEN THE BROWSER WINDOW IS RESIZED (e.g. snapped or split-screen).
 */

export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;

  // Check for developer/preview override (useful for testing or debugging)
  try {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('bypass_mobile') === '1' || urlParams.get('desktop') === '1') {
      return false;
    }
    if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('tzx_mobile_bypass') === 'true') {
      return false;
    }
  } catch {
    // Ignore storage/url errors
  }

  const ua = navigator.userAgent || '';

  // 1. Explicit mobile phone signatures in User-Agent
  // Android phones have "Android" AND "Mobile". (Android tablets have "Android" without "Mobile")
  // iPhone, iPod, Windows Phone, BlackBerry, IEMobile, Opera Mini are handheld phones.
  const isMobilePhoneUa = /iPhone|iPod|Windows Phone|BlackBerry|BB10|IEMobile|Opera Mini|Android.*Mobile|Mobile.*Firefox/i.test(
    ua
  );

  // 2. Client hints mobile flag (available in modern Chromium browsers: Chrome, Edge, etc.)
  const uaData = (navigator as any).userAgentData;
  const isUaDataMobile = uaData?.mobile === true;

  // 3. PHYSICAL SCREEN SIZE (Monitor hardware resolution)
  // CRITICAL DISTINCTION:
  // On desktop PCs and laptops, window.screen.width and window.screen.height represent
  // the physical hardware monitor resolution (e.g., 1920x1080, 1440x900, 2560x1440, etc.).
  // When a PC user resizes their browser window to 400px, window.innerWidth changes,
  // BUT window.screen.width and window.screen.height NEVER CHANGE!
  // On a mobile phone, the physical screen is small: min(screen.width, screen.height) is < 600px.
  const screenMinDimension = Math.min(
    window.screen?.width || 0,
    window.screen?.height || 0
  );

  // 4. Pointer & Hover capabilities
  // Desktop PCs and laptops have fine mouse/trackpad pointer with hover capability.
  // Phones have coarse touch pointer and hover: none.
  const hasFinePointer =
    typeof window.matchMedia === 'function'
      ? window.matchMedia('(pointer: fine)').matches
      : false;
  const hasCoarseOnly =
    typeof window.matchMedia === 'function'
      ? window.matchMedia('(pointer: coarse) and (hover: none)').matches
      : false;

  // RULE 1: PC & LAPTOP LOCKOUT EXEMPTION
  // If the device has a physical screen >= 768px (standard laptop / desktop monitor)
  // and is NOT an explicit mobile phone UA, it is a PC or Laptop.
  // It MUST NOT BE LOCKED, even if the browser window is resized to tiny dimensions!
  if (!isMobilePhoneUa && !isUaDataMobile && screenMinDimension >= 768) {
    return false;
  }

  // If fine pointer is present and UA is not a mobile phone, it is a PC/laptop:
  if (hasFinePointer && !isMobilePhoneUa && !isUaDataMobile) {
    return false;
  }

  // RULE 2: MOBILE PHONE DETECTION
  // If the user agent indicates a mobile phone OR uaData says mobile:
  if (isMobilePhoneUa || isUaDataMobile) {
    return true;
  }

  // Handheld touch device with small physical screen and coarse pointer:
  if (screenMinDimension > 0 && screenMinDimension < 600 && hasCoarseOnly) {
    return true;
  }

  return false;
}
