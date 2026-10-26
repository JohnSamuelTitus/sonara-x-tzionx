/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cinema: {
          bg: '#0A0809',
          surface: '#140F13',
          panel: '#1B1419',
          card: '#231A21',
          cardHover: '#2E222C',
          border: '#3D2E37',
          borderSubtle: '#261C23',
          wine: '#4A0E17',
          wineDark: '#29070D',
          wineGlow: '#731624',
          vermilion: '#D9381E',
          vermilionHover: '#EB4429',
          gold: '#D4AF37',
          goldLight: '#F0DFB0',
          goldMuted: '#A3832B',
          ivory: '#F5EFEB',
          ivoryMuted: '#B8ACA3',
          charcoal: '#121013',
        },
        sonora: {
          bg: '#0A0809',
          surface: '#140F13',
          panel: '#1B1419',
          card: '#231A21',
          cardHover: '#2E222C',
          border: '#3D2E37',
          primary: '#D9381E', // Cinematic Vermilion
          primaryHover: '#EB4429',
          accent: '#D4AF37', // Muted Gold
          muted: '#B8ACA3', // Warm Ivory Muted
          light: '#F5EFEB', // Warm Ivory
        }
      },
      fontFamily: {
        display: ['"Bebas Neue"', 'Syne', 'Ramabhadra', 'sans-serif'],
        cinematic: ['Cinzel', 'Ramabhadra', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"Space Mono"', '"Courier Prime"', 'monospace'],
        telugu: ['Ramabhadra', '"Noto Sans Telugu"', 'sans-serif'],
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 14s linear infinite',
        'equalizer': 'equalizer 1s ease-in-out infinite alternate',
      },
      keyframes: {
        equalizer: {
          '0%': { height: '4px' },
          '100%': { height: '18px' },
        }
      }
    },
  },
  plugins: [],
}
