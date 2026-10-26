export interface CategoryDefinition {
  id: string;
  title: string;
  query: string;
  subtitle: string;
}

export const CATEGORY_DEFINITIONS: CategoryDefinition[] = [
  { id: 'trending', title: 'Trending Now', query: 'trending music songs official video', subtitle: 'Hottest music videos trending right now' },
  { id: 'bollywood', title: 'Top Bollywood Hits', query: 'top bollywood songs hits official music video', subtitle: 'Popular Hindi cinema music and chartbusters' },
  { id: 'south-indian', title: 'Top South Indian Hits', query: 'top south indian hits songs official video', subtitle: 'Mega hits from Tamil, Telugu, Malayalam & Kannada' },
  { id: 'hindi', title: 'Popular Hindi Songs', query: 'popular hindi songs hits official video', subtitle: 'Modern Hindi melodies and rhythms' },
  { id: 'tamil', title: 'Popular Tamil Songs', query: 'popular tamil songs hits official music video', subtitle: 'Kollywood melodies and upbeat tracks' },
  { id: 'telugu', title: 'Popular Telugu Songs', query: 'popular telugu songs hits official music video', subtitle: 'Tollywood anthems and soulful tunes' },
  { id: 'malayalam', title: 'Popular Malayalam Songs', query: 'popular malayalam songs hits official music video', subtitle: 'Soulful sounds from God\'s Own Country' },
  { id: 'kannada', title: 'Popular Kannada Songs', query: 'popular kannada songs hits official music video', subtitle: 'Sandalwood beats and melodies' },
  { id: 'punjabi', title: 'Punjabi Hits', query: 'punjabi hits songs official music video', subtitle: 'High-energy bhangra and urban Punjabi tracks' },
  { id: 'romantic', title: 'Romantic Vibes', query: 'romantic love songs official music video', subtitle: 'Heartfelt ballads and love anthems' },
  { id: 'party', title: 'Party & Dance', query: 'party dance songs club hits official music video', subtitle: 'High-octane club beats to get you moving' },
  { id: 'chill', title: 'Chill & Relax', query: 'chill relax acoustic lo-fi songs official', subtitle: 'Mellow melodies and calming tones for focus' },
  { id: 'latest', title: 'Latest Music Discoveries', query: 'latest songs discoveries official music video', subtitle: 'Fresh releases and breakthrough artists' },
];
