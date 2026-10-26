import type { Track } from '../types/music';

/**
 * Replaceable audio source provider interface.
 * Designed so that future permitted streaming providers (e.g., Audius, Jamendo, custom S3 API)
 * can be plugged in without changing the core player interface or playback UI.
 */
export interface AudioSourceProvider {
  id: string;
  name: string;
  description: string;
  isAvailable(): boolean;
  resolveAudioUrl(track: Track): Promise<string>;
}

export class DefaultDemoSourceProvider implements AudioSourceProvider {
  id = 'sonora-demo-provider';
  name = 'Sonora Verified Demo Catalog';
  description = 'Provides verified royalty-free audio tracks (Public Domain, CC0, and CC-BY 3.0)';

  isAvailable(): boolean {
    return true;
  }

  async resolveAudioUrl(track: Track): Promise<string> {
    if (!track.audioUrl) {
      throw new Error(`Track "${track.title}" has no valid audio URL configured.`);
    }
    return track.audioUrl;
  }
}
