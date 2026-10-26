import type { Track, Playlist, Album, Genre } from '../types/music';

export const DEMO_TRACKS: Track[] = [
  {
    id: 'track-1',
    title: 'Ambient Drift',
    artist: 'sonara Studio Collective',
    album: 'They Call Him OG (Themes)',
    duration: 12,
    coverUrl: '/cinema/og-pawan-kalyan.jpg',
    audioUrl: '/audio/ambient-drift.wav',
    genre: 'TFI Cinematic',
    licenseInfo: 'Creative Commons Zero (CC0) / sonara Sound Lab',
    isLocal: true,
  },
  {
    id: 'track-2',
    title: 'Cyber Pulse',
    artist: 'Anirudh Wave Syndicate',
    album: 'High Voltage Cinema',
    duration: 10,
    coverUrl: '/cinema/anirudh-rockstar.jpg',
    audioUrl: '/audio/cyber-pulse.wav',
    genre: 'TFI Synthwave',
    licenseInfo: 'Creative Commons Zero (CC0) / sonara Sound Lab',
    isLocal: true,
  },
  {
    id: 'track-3',
    title: 'Midnight Groove',
    artist: 'Samantha Melody Lounge',
    album: 'Late Night TFI Drive',
    duration: 14,
    coverUrl: '/cinema/samantha-retro.jpg',
    audioUrl: '/audio/midnight-groove.wav',
    genre: 'TFI Chill Lounge',
    licenseInfo: 'Creative Commons Zero (CC0) / sonara Sound Lab',
    isLocal: true,
  },
  {
    id: 'track-4',
    title: 'SoundHelix Song 1',
    artist: 'T. Schürger & SoundHelix',
    album: 'Baahubali Symphonic Suite',
    duration: 372, // 6:12
    coverUrl: '/cinema/prabhas-baahubali.jpg',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    genre: 'TFI Symphony',
    licenseInfo: 'Creative Commons Attribution 3.0 (CC-BY 3.0)',
    isLocal: false,
  },
  {
    id: 'track-5',
    title: 'SoundHelix Song 2',
    artist: 'T. Schürger & SoundHelix',
    album: 'Pushpa 2 The Rule (Remix)',
    duration: 425, // 7:05
    coverUrl: '/cinema/allu-arjun-pushpa.jpg',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    genre: 'TFI Mass Beats',
    licenseInfo: 'Creative Commons Attribution 3.0 (CC-BY 3.0)',
    isLocal: false,
  },
  {
    id: 'track-6',
    title: 'SoundHelix Song 3',
    artist: 'T. Schürger & SoundHelix',
    album: 'Jersey Emotional Resonance',
    duration: 344, // 5:44
    coverUrl: '/cinema/nani-jersey.jpg',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    genre: 'TFI Melody',
    licenseInfo: 'Creative Commons Attribution 3.0 (CC-BY 3.0)',
    isLocal: false,
  },
];

export const DEMO_GENRES: Genre[] = [
  { id: 'tfi-mass', name: 'TFI Mass & Dance', color: 'from-cinema-vermilion via-cinema-wine to-cinema-bg' },
  { id: 'telugu-melodies', name: 'Soulful Telugu Melodies', color: 'from-amber-900 via-cinema-panel to-cinema-bg' },
  { id: 'golden-era', name: 'Golden Era Classics', color: 'from-yellow-950 via-cinema-wineDark to-cinema-bg' },
  { id: 'anirudh-wave', name: 'Anirudh & South Viral', color: 'from-rose-950 via-cinema-wine to-cinema-bg' },
  { id: 'night-drive', name: 'TFI Midnight Drive', color: 'from-indigo-950 via-purple-950 to-cinema-bg' },
  { id: 'bollywood-spotlight', name: 'Bollywood Spotlight', color: 'from-red-950 via-orange-950 to-cinema-bg' },
];

export const DEMO_PLAYLISTS: Playlist[] = [
  {
    id: 'pl-featured-1',
    title: 'They Call Him OG · Firestorm',
    description: 'Pawan Kalyan, Thaman S, high-voltage brass, and iconic cinema whistle themes.',
    coverUrl: '/cinema/og-pawan-kalyan.jpg',
    trackIds: ['track-2', 'track-1', 'track-4'],
    isUserCreated: false,
    createdAt: '2026-01-15T00:00:00.000Z',
  },
  {
    id: 'pl-featured-2',
    title: 'Baahubali & Rajamouli Epics',
    description: 'Rebel Star Prabhas, M.M. Keeravani orchestral grandeur and historic Indian cinema compositions.',
    coverUrl: '/cinema/prabhas-baahubali.jpg',
    trackIds: ['track-4', 'track-5', 'track-6'],
    isUserCreated: false,
    createdAt: '2026-02-10T00:00:00.000Z',
  },
  {
    id: 'pl-featured-3',
    title: 'Natural Star Nani Melodies',
    description: 'Jersey classics, poignant acoustic ballads, and timeless Telugu melodies.',
    coverUrl: '/cinema/nani-jersey.jpg',
    trackIds: ['track-3', 'track-1', 'track-6'],
    isUserCreated: false,
    createdAt: '2026-03-01T00:00:00.000Z',
  },
];

export const DEMO_ALBUMS: Album[] = [
  {
    id: 'album-1',
    title: 'They Call Him OG (Soundtrack)',
    artist: 'Thaman S · Pawan Kalyan',
    year: 2026,
    coverUrl: '/cinema/og-firestorm.jpg',
    trackIds: ['track-1'],
  },
  {
    id: 'album-2',
    title: 'Jersey (Original Motion Picture)',
    artist: 'Anirudh Ravichander · Nani',
    year: 2025,
    coverUrl: '/cinema/nani-jersey.jpg',
    trackIds: ['track-2'],
  },
  {
    id: 'album-3',
    title: 'Baahubali: The Beginning',
    artist: 'M.M. Keeravani · Prabhas',
    year: 2024,
    coverUrl: '/cinema/prabhas-chatrapathi.jpg',
    trackIds: ['track-4', 'track-5', 'track-6'],
  },
];
