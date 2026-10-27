import React from 'react';
import { Disc3, Radio, Sparkles } from 'lucide-react';

export const MobileAnnouncementView: React.FC = () => {
  return (
    <div
      role="region"
      aria-label="Mobile Under Development Announcement"
      className="min-h-[100dvh] w-full flex flex-col justify-between items-center bg-[#090708] text-cinema-ivory relative overflow-y-auto overflow-x-hidden px-4 sm:px-6 pt-[max(1.25rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))] select-none"
    >
      {/* 1. Subtle Retro Cinematic Background Lighting */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {/* Warm Burgundy Ambient Aura */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] sm:w-[420px] h-[320px] sm:h-[420px] rounded-full bg-cinema-wine/25 blur-[110px]" />
        {/* Soft Muted Gold Highlight */}
        <div className="absolute bottom-1/3 left-1/2 -translate-x-1/2 translate-y-1/3 w-[260px] sm:w-[340px] h-[260px] sm:h-[340px] rounded-full bg-cinema-gold/10 blur-[90px]" />
        {/* Subtle Horizontal Analog Scanlines */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255, 255, 255, 0.12) 1px, transparent 1px)',
            backgroundSize: '100% 3px',
          }}
        />
      </div>

      {/* 2. Top Header Brand Lockup */}
      <header className="relative z-10 w-full max-w-md flex items-center justify-between py-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cinema-wine via-[#24060B] to-cinema-panel border border-cinema-gold/40 flex items-center justify-center shadow-md">
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

        {/* Vintage Tape Counter Status */}
        <div className="tape-counter font-mono text-[10px] tracking-widest uppercase px-2.5 py-1 bg-black/70 border border-cinema-gold/30 rounded shadow-sm text-cinema-gold">
          00:00 · STANDBY
        </div>
      </header>

      {/* 3. Center Announcement Card */}
      <main className="relative z-10 w-full max-w-md my-auto py-6 sm:py-8 flex flex-col items-center text-center">
        {/* Vinyl-Inspired Visual with Grooved Record Rim */}
        <div className="relative mb-6 flex items-center justify-center">
          {/* Ambient Glow Ring */}
          <div className="absolute w-36 h-36 rounded-full bg-cinema-gold/15 blur-2xl pointer-events-none" />

          {/* Stylized Vinyl Disc Outer Ring */}
          <div className="relative w-32 h-32 sm:w-36 sm:h-36 rounded-full bg-gradient-to-b from-[#1E171D] via-[#100C0F] to-[#0A0709] border-2 border-cinema-gold/40 p-2.5 shadow-[0_12px_36px_rgba(0,0,0,0.85)] flex items-center justify-center">
            {/* Concentric Grooved Record Rings */}
            <div className="w-full h-full rounded-full border border-cinema-border/60 p-2.5 flex items-center justify-center">
              <div className="w-full h-full rounded-full border border-white/10 p-2 flex items-center justify-center">
                {/* Center Vinyl Label with Slow Cinematic Spin */}
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cinema-wine via-cinema-wineDark to-black border border-cinema-gold/60 flex items-center justify-center shadow-inner animate-spin-slow">
                  <Disc3 className="w-6 h-6 text-cinema-gold" />
                </div>
              </div>
            </div>

            {/* Glowing Accent Badge */}
            <div className="absolute -bottom-2 px-2.5 py-0.5 rounded-full bg-black/90 border border-cinema-gold/40 flex items-center gap-1.5 shadow-md">
              <Sparkles className="w-3 h-3 text-cinema-gold" />
              <span className="font-mono text-[9px] font-bold text-cinema-gold uppercase tracking-widest">
                Analog Hi-Fi
              </span>
            </div>
          </div>
        </div>

        {/* Status Label */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cinema-wine/40 border border-cinema-gold/30 text-cinema-gold font-mono text-[10px] sm:text-[11px] font-bold tracking-widest uppercase mb-4 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-cinema-gold animate-pulse shadow-[0_0_8px_#D4AF37]" />
          <span>MOBILE VERSION · UNDER DEVELOPMENT</span>
        </div>

        {/* Heading */}
        <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-wide uppercase text-gold-gradient leading-tight mb-3 px-2">
          Our Mobile Experience Is Coming Soon
        </h1>

        {/* Message */}
        <p className="font-sans text-xs sm:text-sm text-cinema-ivoryMuted/90 leading-relaxed max-w-sm sm:max-w-md px-2">
          We’re working hard to bring you a beautiful, smooth, and complete Sonara experience on
          mobile. Our mobile version is currently under development, and we’re making improvements to
          deliver the best possible listening experience. Thank you for your patience and for being
          part of our journey.
        </p>

        {/* Subtle Feature Badge */}
        <div className="mt-6 px-4 py-2 rounded-xl bg-cinema-panel/60 border border-cinema-border/50 text-[11px] font-mono text-cinema-ivoryMuted/80 flex items-center gap-2">
          <span className="text-cinema-gold">✦</span>
          <span>Designed for Big Screens, Laptops &amp; Studio Displays</span>
        </div>
      </main>

      {/* 4. Footer Closing Line */}
      <footer className="relative z-10 w-full max-w-md text-center py-3 border-t border-cinema-border/30">
        <p className="font-mono text-xs text-cinema-ivoryMuted/70 tracking-wider">
          Made with passion by TzionX and its team.
        </p>
      </footer>
    </div>
  );
};
