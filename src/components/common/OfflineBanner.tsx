import React, { useState } from 'react';
import { WifiOff, RotateCcw, X } from 'lucide-react';
import { KeycapButton } from './KeycapButton';

interface OfflineBannerProps {
  isOnline: boolean;
  onRetry?: () => void;
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({ isOnline, onRetry }) => {
  const [isDismissed, setIsDismissed] = useState(false);

  // If online, reset dismissal so next time it goes offline, it shows
  if (isOnline && isDismissed) {
    setIsDismissed(false);
  }

  if (isOnline || isDismissed) return null;

  return (
    <div
      role="alert"
      aria-live="polite"
      className="bg-gradient-to-r from-[#3D0D14] via-[#24060B] to-[#120306] border-b border-cinema-gold/40 px-4 py-2 text-cinema-ivory text-xs flex items-center justify-between z-50 shadow-lg animate-in slide-in-from-top duration-300"
    >
      <div className="flex items-center gap-2.5 min-w-0 mr-3">
        <WifiOff className="w-4 h-4 text-cinema-vermilion flex-shrink-0 animate-pulse" />
        <div className="min-w-0 font-sans text-xs">
          <span className="font-mono font-bold text-cinema-gold uppercase tracking-wider mr-2 text-[10px] sm:text-xs">
            Offline Mode:
          </span>
          <span className="text-cinema-ivory truncate inline sm:inline-block">
            Internet connection lost. Local music & saved library remain fully accessible.
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <KeycapButton
          variant="deck"
          shape="square"
          size="xs"
          onClick={() => {
            if (onRetry) onRetry();
            else window.location.reload();
          }}
          aria-label="Retry connection"
          icon={<RotateCcw className="w-3 h-3 text-cinema-gold" />}
        >
          Retry
        </KeycapButton>
        <button
          type="button"
          onClick={() => setIsDismissed(true)}
          aria-label="Dismiss offline notice"
          className="p-1 rounded text-cinema-ivoryMuted hover:text-white transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
