import React from 'react';
import { Monitor, Laptop, Radio, ArrowUpRight } from 'lucide-react';

interface MobileLockoutViewProps {
  onBypass?: () => void;
}

export const MobileLockoutView: React.FC<MobileLockoutViewProps> = ({ onBypass }) => {
  return (
    <div className="min-h-screen w-full flex flex-col justify-between items-center bg-[#090708] text-cinema-ivory relative overflow-hidden px-6 py-8 select-none">
      {/* Background Retro Ambient Illumination */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] rounded-full bg-cinema-gold/10 blur-[100px]" />
        <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 translate-y-1/2 w-[300px] h-[300px] rounded-full bg-cinema-wine/20 blur-[90px]" />
        {/* Subtle retro horizontal scanlines */}
        <div 
          className="absolute inset-0 opacity-[0.03]" 
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '100% 4px' }} 
        />
      </div>

      {/* Top Brand Bar */}
      <header className="relative z-10 w-full max-w-md flex items-center justify-between pt-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cinema-wine to-cinema-panel border border-cinema-gold/40 flex items-center justify-center shadow-lg">
            <Radio className="w-4 h-4 text-cinema-gold" />
          </div>
          <div>
            <span className="font-cinematic font-bold text-sm tracking-wider uppercase text-cinema-ivory block leading-tight">
              Sonara <span className="text-cinema-gold">X</span> TzionX
            </span>
            <span className="font-mono text-[9px] text-cinema-ivoryMuted/70 tracking-widest uppercase block">
              Luxury Made Affordable
            </span>
          </div>
        </div>

        {/* Vintage Tape Counter Pill */}
        <div className="tape-counter font-mono text-[10px] tracking-widest uppercase px-2.5 py-1">
          00:00 · STANDBY
        </div>
      </header>

      {/* Main Lockout Notice Card */}
      <main className="relative z-10 w-full max-w-md my-auto py-8 text-center flex flex-col items-center">
        {/* Retro Hardware Monitor Visual */}
        <div className="relative mb-6">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-b from-[#1E171D] to-[#120D11] border-2 border-cinema-gold/40 flex items-center justify-center shadow-[0_0_35px_rgba(212,175,55,0.2)]">
            <div className="relative">
              <Monitor className="w-12 h-12 text-cinema-gold stroke-[1.5]" />
              <Laptop className="w-6 h-6 text-cinema-ivory absolute -bottom-1 -right-2 bg-cinema-surface p-0.5 rounded border border-cinema-border/80" />
            </div>
          </div>
          {/* Glowing Status LED */}
          <div className="absolute -top-1 -right-1 flex items-center gap-1 bg-black/80 px-2 py-0.5 rounded-full border border-cinema-border text-[9px] font-mono text-cinema-gold">
            <span className="w-2 h-2 rounded-full bg-cinema-gold animate-pulse" />
            PC / LAPTOP
          </div>
        </div>

        {/* Exclusive Platform Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cinema-wine/40 border border-cinema-gold/30 text-cinema-gold font-mono text-[10px] tracking-widest uppercase mb-4 shadow-sm">
          <span>Big Screens, Laptops &amp; PC Only</span>
        </div>

        {/* Requested Primary Message */}
        <div className="space-y-4 px-2">
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-wide uppercase text-cinema-ivory leading-tight">
            We're working on a mobile version! For the best experience, please open this on your laptop or PC
          </h1>

          <p className="font-sans text-xs text-cinema-ivoryMuted/90 leading-relaxed max-w-sm mx-auto">
            Sonara X TzionX is an analog-inspired, high-fidelity cinema music workstation engineered specifically for studio displays, laptops, and mechanical desktop controls.
          </p>
        </div>

        {/* Hardware Features List */}
        <div className="w-full mt-6 p-4 rounded-xl bg-cinema-panel/60 border border-cinema-border/50 text-left space-y-2 text-xs font-mono">
          <div className="flex items-center justify-between text-cinema-ivoryMuted text-[11px]">
            <span>Optimized Viewport:</span>
            <span className="text-cinema-gold font-bold">1024px &amp; Above</span>
          </div>
          <div className="flex items-center justify-between text-cinema-ivoryMuted text-[11px]">
            <span>Supported Systems:</span>
            <span className="text-cinema-ivory">Windows · macOS · Linux</span>
          </div>
          <div className="flex items-center justify-between text-cinema-ivoryMuted text-[11px]">
            <span>Control Mode:</span>
            <span className="text-cinema-ivory">Mechanical Typewriter Keycaps</span>
          </div>
        </div>

        {/* Developer / Testing Bypass (useful when emulating or reviewing) */}
        {onBypass && (
          <button
            type="button"
            onClick={onBypass}
            className="mt-6 inline-flex items-center gap-1 text-[11px] font-mono text-cinema-ivoryMuted/60 hover:text-cinema-gold transition-colors underline underline-offset-4"
          >
            <span>Preview Desktop UI Anyway</span>
            <ArrowUpRight className="w-3 h-3" />
          </button>
        )}
      </main>

      {/* Footer Required Attribution */}
      <footer className="relative z-10 w-full text-center pt-4 border-t border-cinema-border/30">
        <p className="text-[11px] text-cinema-ivoryMuted/60 font-mono tracking-wider">
          A product of TzionX and its team
        </p>
      </footer>
    </div>
  );
};
