import React from 'react';
import { X, Download, Share2, PlusSquare, Smartphone, Monitor, CheckCircle2 } from 'lucide-react';
import { KeycapButton } from './KeycapButton';

interface InstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInstallNative?: () => void;
  canPromptNative: boolean;
  isIos: boolean;
}

export const InstallModal: React.FC<InstallModalProps> = ({
  isOpen,
  onClose,
  onInstallNative,
  canPromptNative,
  isIos,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="install-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md max-h-[90vh] overflow-y-auto bg-cinema-surface border-2 border-cinema-gold/40 rounded-2xl p-5 sm:p-6 shadow-2xl text-cinema-ivory space-y-4 sm:space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-cinema-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#4A0E17] via-[#24060B] to-[#120306] flex items-center justify-center border border-cinema-gold/40 shadow-md">
              <Download className="w-5 h-5 text-cinema-gold" />
            </div>
            <div>
              <h2 id="install-modal-title" className="font-display text-xl tracking-wider uppercase text-cinema-ivory">
                Install Sonara
              </h2>
              <p className="text-[11px] font-mono text-cinema-gold uppercase tracking-tight">
                Standalone Cinema Audio Experience
              </p>
            </div>
          </div>

          <KeycapButton
            variant="deck"
            shape="circle"
            size="xs"
            onClick={onClose}
            aria-label="Close install modal"
            icon={<X className="w-3.5 h-3.5 text-cinema-ivoryMuted" />}
          />
        </div>

        {/* Benefits List */}
        <div className="grid grid-cols-2 gap-2 text-xs font-sans">
          <div className="p-2.5 rounded-lg bg-cinema-panel/60 border border-cinema-border/40 flex items-start gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-cinema-gold flex-shrink-0 mt-0.5" />
            <span>Launch without browser borders or address bar</span>
          </div>
          <div className="p-2.5 rounded-lg bg-cinema-panel/60 border border-cinema-border/40 flex items-start gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-cinema-gold flex-shrink-0 mt-0.5" />
            <span>Fast instant launch & offline local tape playback</span>
          </div>
        </div>

        {/* Guidance Content depending on platform */}
        {canPromptNative ? (
          <div className="space-y-4">
            <p className="text-xs text-cinema-ivoryMuted font-sans leading-relaxed">
              Install <strong>sonara X TzionX</strong> directly on your device home screen or desktop application drawer for seamless audio playback.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <KeycapButton
                variant="deck"
                shape="pill"
                size="md"
                onClick={onClose}
              >
                Later
              </KeycapButton>
              <KeycapButton
                variant="primary"
                shape="pill"
                size="md"
                onClick={() => {
                  onInstallNative?.();
                  onClose();
                }}
                icon={<Download className="w-4 h-4 fill-current mr-1" />}
                className="font-bold shadow-xl"
              >
                Install Now
              </KeycapButton>
            </div>
          </div>
        ) : isIos ? (
          <div className="space-y-3 font-sans text-xs">
            <p className="text-cinema-ivory font-medium">
              To install Sonara on your iPhone or iPad:
            </p>
            <ol className="space-y-2.5 bg-cinema-panel/80 p-3.5 rounded-xl border border-cinema-border/60">
              <li className="flex items-center gap-3">
                <span className="w-5 h-5 rounded-full bg-cinema-wine text-cinema-gold font-mono text-xs flex items-center justify-center font-bold">1</span>
                <span>Tap the <strong>Share</strong> button <Share2 className="w-3.5 h-3.5 inline text-cinema-gold mx-1" /> in Safari's bottom toolbar.</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="w-5 h-5 rounded-full bg-cinema-wine text-cinema-gold font-mono text-xs flex items-center justify-center font-bold">2</span>
                <span>Scroll down and tap <strong>Add to Home Screen</strong> <PlusSquare className="w-3.5 h-3.5 inline text-cinema-gold mx-1" />.</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="w-5 h-5 rounded-full bg-cinema-wine text-cinema-gold font-mono text-xs flex items-center justify-center font-bold">3</span>
                <span>Tap <strong>Add</strong> in the top-right corner to finish.</span>
              </li>
            </ol>
            <div className="flex justify-end pt-2">
              <KeycapButton
                variant="deck"
                shape="pill"
                size="md"
                onClick={onClose}
              >
                Got it
              </KeycapButton>
            </div>
          </div>
        ) : (
          <div className="space-y-3 font-sans text-xs">
            <p className="text-cinema-ivoryMuted leading-relaxed">
              To install Sonara in your browser:
            </p>
            <div className="bg-cinema-panel/80 p-3.5 rounded-xl border border-cinema-border/60 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-cinema-gold">
                <Monitor className="w-4 h-4" />
                <span className="font-bold">Desktop Chrome / Edge / Brave:</span>
              </div>
              <p className="text-cinema-ivoryMuted">
                Click the <strong>Install</strong> icon (computer or plus symbol) located on the right side of your browser's address bar.
              </p>
              <div className="flex items-center gap-2 text-cinema-gold pt-2">
                <Smartphone className="w-4 h-4" />
                <span className="font-bold">Android Chrome:</span>
              </div>
              <p className="text-cinema-ivoryMuted">
                Tap the <strong>Menu</strong> (⋮) in the top-right corner and select <strong>"Add to Home screen"</strong> or <strong>"Install app"</strong>.
              </p>
            </div>
            <div className="flex justify-end pt-2">
              <KeycapButton
                variant="deck"
                shape="pill"
                size="md"
                onClick={onClose}
              >
                Close
              </KeycapButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
