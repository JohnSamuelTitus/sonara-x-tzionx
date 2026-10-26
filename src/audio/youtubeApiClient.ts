// ==============================================================================
// Sonora — Frontend YouTube API Client
// ==============================================================================
// Makes requests strictly to Sonora's backend /api/youtube/* endpoints.
// No API keys are required or accessed in the browser.
// ==============================================================================

import type { Track, MusicCategory } from '../types/music';

export interface YouTubeSearchResult {
  tracks: Track[];
  totalResults: number;
  configured: boolean;
  message?: string;
  error?: string;
  code?: string;
}

export interface YouTubeStatusResult {
  configured: boolean;
  mode?: 'public-no-key' | 'official-api';
  activeProvider?: string;
  isOfficialKeyPresent?: boolean;
  cacheEntries?: number;
  availableCategories?: Array<{ id: string; title: string; subtitle: string }>;
}

export async function checkYouTubeStatus(): Promise<YouTubeStatusResult> {
  try {
    const res = await fetch('/api/youtube/status');
    if (!res.ok) {
      return { configured: false };
    }
    return await res.json();
  } catch {
    return { configured: false };
  }
}

export async function fetchCategories(): Promise<{ categories: MusicCategory[]; configured: boolean }> {
  try {
    const res = await fetch('/api/youtube/categories');
    if (!res.ok) {
      return { categories: [], configured: false };
    }
    return await res.json();
  } catch {
    return { categories: [], configured: false };
  }
}

export async function searchYouTubeTracks(query: string, maxResults = 12): Promise<YouTubeSearchResult> {
  const clean = query.trim();
  if (!clean) {
    return { tracks: [], totalResults: 0, configured: true };
  }

  try {
    const res = await fetch(
      `/api/youtube/search?q=${encodeURIComponent(clean)}&maxResults=${encodeURIComponent(maxResults)}`
    );

    const data = await res.json();
    if (!res.ok) {
      return {
        tracks: [],
        totalResults: 0,
        configured: data.configured !== false,
        error: data.error || `Search failed with status ${res.status}`,
        code: data.code,
      };
    }

    return {
      tracks: data.tracks || [],
      totalResults: data.totalResults || 0,
      configured: data.configured !== false,
      message: data.message,
    };
  } catch (err) {
    return {
      tracks: [],
      totalResults: 0,
      configured: true,
      error: 'Unable to connect to Sonora music service. Please check your network connection.',
    };
  }
}

export async function fetchCategoryTracks(categoryId: string, maxResults = 12): Promise<YouTubeSearchResult> {
  try {
    const res = await fetch(
      `/api/youtube/category?category=${encodeURIComponent(categoryId)}&maxResults=${encodeURIComponent(maxResults)}`
    );

    const data = await res.json();
    if (!res.ok) {
      return {
        tracks: [],
        totalResults: 0,
        configured: data.configured !== false,
        error: data.error || `Category load failed with status ${res.status}`,
        code: data.code,
      };
    }

    return {
      tracks: data.tracks || [],
      totalResults: data.totalResults || 0,
      configured: data.configured !== false,
      message: data.message,
    };
  } catch (err) {
    return {
      tracks: [],
      totalResults: 0,
      configured: true,
      error: 'Network error while loading category tracks.',
    };
  }
}
