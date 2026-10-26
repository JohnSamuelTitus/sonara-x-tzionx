import type { Track } from './music';

declare module '../../../server/searchProviders.js' {
  export function decodeHtmlEntities(str: string): string;
  export class BaseSearchProvider {
    name: string;
    constructor(name: string);
    search(query: string, limit?: number, genreLabel?: string): Promise<{ tracks: Track[]; totalResults: number; provider?: string }>;
    isAvailable(): Promise<boolean> | boolean;
  }
  export class PipedSearchProvider extends BaseSearchProvider {
    constructor(mirrors?: string[], timeoutMs?: number);
  }
  export class InvidiousSearchProvider extends BaseSearchProvider {
    constructor(mirrors?: string[], timeoutMs?: number);
  }
  export class OfficialYouTubeApiProvider extends BaseSearchProvider {
    constructor(getApiKeyFn: () => string);
  }
  export class CompositeSearchProvider extends BaseSearchProvider {
    constructor(providers: BaseSearchProvider[]);
    getMode(): 'public-no-key' | 'official-api';
    getActiveProviderName(): string;
  }
}

declare module '../../server/searchProviders.js' {
  export function decodeHtmlEntities(str: string): string;
  export class BaseSearchProvider {
    name: string;
    constructor(name: string);
    search(query: string, limit?: number, genreLabel?: string): Promise<{ tracks: Track[]; totalResults: number; provider?: string }>;
    isAvailable(): Promise<boolean> | boolean;
  }
  export class PipedSearchProvider extends BaseSearchProvider {
    constructor(mirrors?: string[], timeoutMs?: number);
  }
  export class InvidiousSearchProvider extends BaseSearchProvider {
    constructor(mirrors?: string[], timeoutMs?: number);
  }
  export class OfficialYouTubeApiProvider extends BaseSearchProvider {
    constructor(getApiKeyFn: () => string);
  }
  export class CompositeSearchProvider extends BaseSearchProvider {
    constructor(providers: BaseSearchProvider[]);
    getMode(): 'public-no-key' | 'official-api';
    getActiveProviderName(): string;
  }
}

declare module '../../../server/youtubeService.js' {
  export interface CategoryDefinition {
    id: string;
    title: string;
    query: string;
    subtitle: string;
  }

  export const CATEGORY_DEFINITIONS: CategoryDefinition[];
  export function decodeHtmlEntities(str: string): string;
  export function isYouTubeConfigured(): boolean;
  export function isOfficialApiKeyConfigured(): boolean;
  export function getApiKey(): string;
  export function sanitizeQuery(query: string): string;
  export function searchYouTube(
    query: string,
    maxResults?: number,
    genreLabel?: string
  ): Promise<{
    tracks: Track[];
    totalResults: number;
    configured?: boolean;
    mode?: string;
    activeProvider?: string;
    message?: string;
  }>;
  export function getCategoryTracks(
    categoryId: string,
    maxResults?: number
  ): Promise<{
    tracks: Track[];
    totalResults: number;
    configured?: boolean;
    mode?: string;
    activeProvider?: string;
    message?: string;
  }>;
  export function getServiceStatus(): {
    configured: boolean;
    mode?: string;
    activeProvider?: string;
    isOfficialKeyPresent?: boolean;
    cacheEntries: number;
    availableCategories: Array<{ id: string; title: string; subtitle: string }>;
  };
  export function clearCache(): void;
  export function getCacheStats(): { entries: number };
}

declare module '../../server/youtubeService.js' {
  export interface CategoryDefinition {
    id: string;
    title: string;
    query: string;
    subtitle: string;
  }

  export const CATEGORY_DEFINITIONS: CategoryDefinition[];
  export function decodeHtmlEntities(str: string): string;
  export function isYouTubeConfigured(): boolean;
  export function isOfficialApiKeyConfigured(): boolean;
  export function getApiKey(): string;
  export function sanitizeQuery(query: string): string;
  export function searchYouTube(
    query: string,
    maxResults?: number,
    genreLabel?: string
  ): Promise<{
    tracks: Track[];
    totalResults: number;
    configured?: boolean;
    mode?: string;
    activeProvider?: string;
    message?: string;
  }>;
  export function getCategoryTracks(
    categoryId: string,
    maxResults?: number
  ): Promise<{
    tracks: Track[];
    totalResults: number;
    configured?: boolean;
    mode?: string;
    activeProvider?: string;
    message?: string;
  }>;
  export function getServiceStatus(): {
    configured: boolean;
    mode?: string;
    activeProvider?: string;
    isOfficialKeyPresent?: boolean;
    cacheEntries: number;
    availableCategories: Array<{ id: string; title: string; subtitle: string }>;
  };
  export function clearCache(): void;
  export function getCacheStats(): { entries: number };
}

declare module './server/middleware.js' {
  import type { IncomingMessage, ServerResponse } from 'http';
  export function createYouTubeMiddleware(): (
    req: IncomingMessage,
    res: ServerResponse,
    next: () => void
  ) => void;
}
