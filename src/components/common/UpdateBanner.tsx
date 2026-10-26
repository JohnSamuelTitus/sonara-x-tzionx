import React, { useState } from 'react';
import { Sparkles, RefreshCw, X } from 'lucide-react';
import { KeycapButton } from './KeycapButton';

interface UpdateBannerProps {
  hasUpdate: boolean;
  onApplyUpdate: () => void;
}

export const UpdateBanner: React.FC<UpdateBannerProps> = ({ hasUpdate, onApplyUpdate }) => {
  const [isDismissed, setIsDismissed] = useState(false);

  if (!hasUpdate || isDismissed) return null;

  return (
    <div
      role="status"
      className="bg-gradient-to-r from-[#1E1710] via-[#2A1F13] to-[#120F0A] border-b border-cinema-gold/50 px-4 py-2 text-cinema-ivory text-xs flex items-center justify-between z-50 shadow-md animate-in slide-in-from-top duration-300"
    >
      <div className="flex items-center gap-2.5 min-w-0 mr-3">
        <Sparkles className="w-4 h-4 text-cinema-gold flex-shrink-0 animate-spin-slow" />
        <div className="min-w-0 font-sans text-xs">
          <span className="font-mono font-bold text-cinema-gold uppercase tracking-wider mr-2 text-[10px] sm:text-xs">
            Update Ready:
          </span>
          <span className="text-cinema-ivory truncate inline sm:inline-block">
            A new version of Sonara is available. Refresh when convenient to upgrade.
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <KeycapButton
          variant="gold"
          shape="square"
          size="xs"
          onClick={onApplyUpdate}
          aria-label="Refresh to update app"
          icon={<RefreshCw className="w-3 h-3 text-black" />}
        >
          Refresh
        </KeycapButton>
        <button
          type="button"
          onClick={() => setIsDismissed(true)}
          aria-label="Dismiss update notice"
          className="p-1 rounded text-cinema-ivoryMuted hover:text-white transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
