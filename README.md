# Sonora 🎵
### Spotify-Style Music Streaming & Discovery Platform with YouTube Integration

Sonora is a modern, responsive web application designed for music discovery and playback. It blends the usability and information density of Spotify with an original dark obsidian and emerald design system. Sonora combines synthesized local audio with official YouTube music search and embedded IFrame playback through a secure backend proxy.

---

## 🌟 Key Features

- **Alive & Populated Homepage (16 Sections)**:
  - **13 Music Discovery Sections**: Trending Now, Top Bollywood Hits, Top South Indian Hits, Popular Hindi Songs, Popular Tamil Songs, Popular Telugu Songs, Popular Malayalam Songs, Popular Kannada Songs, Punjabi Hits, Romantic Vibes, Party & Dance, Chill & Relax, and Latest Music Discoveries.
  - **3 Personalized Sections**: Recently Played (from genuine listening history), Your Playlists (custom user playlists), and Liked Songs.
  - **Sonora Studio Exclusives**: 16-bit 44.1kHz PCM synthesized offline tracks (zero latency, CC0) and CC-BY 3.0 generative compositions.
- **Dedicated Category Views**: "Show all" opens full-page category streams with Play All, Shuffle Play, and live search/filtering.
- **Real YouTube Data API v3 Search**: Debounced search by title, artist, soundtrack, and multilingual queries (Hindi, Tamil, Telugu, Punjabi, English, etc.) with in-memory caching and request deduplication.
- **Embedded YouTube Playback inside Sonora**: Powered strictly by the official **YouTube IFrame Player API** (`YT.Player`). No audio scraping, no unauthorized downloaders.
- **Docked / Minimizable Video Surface**: Seamless video viewport that preserves playback during view changes.
- **Dual Playback Engine Architecture**: Unified track model coordinates between `AudioEngine` (HTMLAudioElement for local PCM) and `YouTubePlayerEngine` (YouTube IFrame), pausing the inactive engine to prevent dual audio.
- **Comprehensive Player Controls**: Play/Pause, Seek, Volume, Mute, Shuffle, 3-mode Repeat (`off`, `all`, `one`), and Up Next Queue Drawer.
- **Complete Playlist & Library Management**: Create, rename, delete custom playlists, add/remove tracks, like/unlike tracks, and persist user state across page refreshes via validated `localStorage`.
- **Keyboard Shortcuts**: Space (Play/Pause), Left/Right Arrows (Seek ±5s), Up/Down Arrows (Volume ±5%), 'M' (Mute/Unmute), with text input protection.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       Sonora Frontend                       │
│  (React 19 + TypeScript + Vite + Tailwind CSS + Lucide)     │
└──────────────┬───────────────────────────────┬──────────────┘
               │                               │
        Search / Categories              Audio Controls
        REST API Calls                         │
               │                               ▼
               ▼                    ┌─────────────────────────┐
 ┌───────────────────────────┐      │      PlayerContext      │
 │  Sonora Backend Proxy     │      │ (Single Source of Truth)│
 │  (Node.js / Vite Server)  │      └──────┬───────────┬──────┘
 ├───────────────────────────┤             │           │
 │ • Sanitizes queries       │      Local Tracks  YouTube Tracks
 │ • Caches results (15m TTL)│             │           │
 │ • Protects API secrets    │             ▼           ▼
 └─────────────┬─────────────┘      ┌─────────────┐ ┌──────────────┐
               │                    │ AudioEngine │ │YouTubePlayer │
               ▼                    │ (HTMLAudio) │ │Engine(IFrame)│
 ┌───────────────────────────┐      └─────────────┘ └──────────────┘
 │ YouTube Data API v3       │                             │
 │ (Official search.list)    │                             ▼
 └───────────────────────────┘                YouTube IFrame Player
```

### Security & Secrets Protection
- **No Client Secrets**: The `YOUTUBE_API_KEY` is loaded strictly on the server-side (`server/youtubeService.js` via `.env`).
- **Never Bundled**: No `VITE_YOUTUBE_API_KEY` exists in any client bundle or JavaScript asset.
- **Git Protection**: `.env` is ignored in `.gitignore`. A safe `.env.example` provides template values only.
- **Safe Error Reporting**: API quota or upstream failures are surfaced to users with helpful actionable guidance without leaking stack traces or credentials.

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v20+ recommended (verified on Node.js `v24.22.1`).
- **npm**: On Windows PowerShell, use `npm.cmd` if standard `npm` is not globally linked.

### 1. Installation
Navigate into the `music-app` directory and install dependencies:
```powershell
cd "C:\projects\revierse enfg\music-app"
npm.cmd install
```

### 2. Environment Configuration
Copy `.env.example` to `.env`:
```powershell
cp .env.example .env
```
Open `.env` and set your YouTube Data API v3 key:
```env
YOUTUBE_API_KEY=your_actual_google_cloud_api_key_here
PORT=3001
```

> **Note**: If `YOUTUBE_API_KEY` is left blank or unconfigured, Sonora remains 100% operational in offline/demo mode with synthesized local PCM audio and displays a clear configuration banner.

---

## 🔑 How to Obtain a YouTube Data API Key

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project or select an existing one.
3. In the sidebar, navigate to **APIs & Services** > **Library**.
4. Search for **"YouTube Data API v3"** and click **Enable**.
5. Go to **APIs & Services** > **Credentials**.
6. Click **Create Credentials** > **API Key**.
7. (Recommended) Click **Restrict Key** and limit its API restriction to **YouTube Data API v3**.
8. Copy the generated key and paste it into your server `.env` file as `YOUTUBE_API_KEY`.

---

## 💻 Running Sonora

### Development Mode (Full App + Integrated Proxy)
The Vite development server incorporates the Sonora YouTube backend proxy automatically:
```powershell
npm.cmd run dev
```
Open your browser at `http://localhost:5173`.

### Standalone Backend Server (Optional)
If running a separated microservice architecture:
```powershell
npm.cmd run server
```

### Production Build
Type-checks the full project with `tsc -b` and builds production-optimized assets with `vite build`:
```powershell
npm.cmd run build
```
To preview the production build locally:
```powershell
npm.cmd run preview
```

---

## 🧪 Automated Testing

Sonora features a comprehensive automated test suite powered by Vitest, containing **71 passing tests across 15 test suites**:

```powershell
npm.cmd test
```

### Test Coverage Highlights
- **Regression Suite**: Application initialization, queue navigation, shuffle history, repeat modes (`off`, `all`, `one`), time formatters.
- **Storage & State Persistence**: User playlists, liked songs persistence, recently played gating, corrupted storage self-healing.
- **YouTube Engine & Player**: Official IFrame API mocks, initialization, play/pause synchronization, volume/mute, seek, embed restriction handling (codes 101/150), and resource cleanup.
- **YouTube Service & Backend**: HTML entity decoding, category definitions completeness, 15-minute query caching, query sanitization.
- **Category Views & Navigation**: All 13 regional and mood categories, query uniqueness, category filtering.
- **Security & Privacy**: Enforcing `.env` in `.gitignore`, absence of `VITE_YOUTUBE_API_KEY` in frontend code, sanitization of user search strings, safe error propagation.

---

## ⚠️ Quota & Platform Considerations

- **YouTube API Quota**: YouTube Data API v3 provides 10,000 free quota units per day by default. Each `search.list` request consumes 100 units. To minimize quota usage, Sonora implements an in-memory 15-minute TTL cache and request deduplication.
- **Embed Restrictions (Code 101/150)**: Certain music videos are restricted by copyright holders from playing inside third-party embedded IFrames. Sonora detects this condition and displays a clear notice with a suggestion to play alternative releases.
- **Autoplay Restrictions**: Modern browsers restrict automatic media playback without user interaction. Playback begins upon explicit user action (e.g. clicking Play).
- **Official Player Compliance**: Embedded playback utilizes the standard YouTube IFrame controls and branding in accordance with YouTube Developer Policies.
