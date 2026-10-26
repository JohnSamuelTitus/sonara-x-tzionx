import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Security, Environment & Secrets Protection', () => {
  const rootDir = path.resolve(__dirname, '../../');

  it('verifies that .env is present in .gitignore', () => {
    const gitignorePath = path.join(rootDir, '.gitignore');
    expect(fs.existsSync(gitignorePath)).toBe(true);

    const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
    const lines = gitignoreContent.split('\n').map((l: string) => l.trim());

    // Must ignore .env files
    const hasEnvIgnore = lines.some((l: string) => l === '.env' || l === '*.env' || l === '.env*');
    expect(hasEnvIgnore).toBe(true);
  });

  it('verifies that .env.example contains only safe placeholders and no real secrets', () => {
    const envExamplePath = path.join(rootDir, '.env.example');
    expect(fs.existsSync(envExamplePath)).toBe(true);

    const content = fs.readFileSync(envExamplePath, 'utf8');
    expect(content).toContain('YOUTUBE_API_KEY=');

    // Must NOT contain an actual Google Cloud API key (typically AIzaSy...)
    expect(content).not.toMatch(/AIzaSy[A-Za-z0-9_-]{33}/);
    expect(content).toContain('your_youtube_data_api_v3_key_here');
  });

  it('ensures NO frontend source file imports or references VITE_YOUTUBE_API_KEY', () => {
    const srcDir = path.resolve(__dirname, '../');

    function scanFiles(dir: string): string[] {
      const results: string[] = [];
      const list = fs.readdirSync(dir);
      for (const file of list) {
        if (file.includes('.test.')) continue;
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          results.push(...scanFiles(fullPath));
        } else if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js')) {
          results.push(fullPath);
        }
      }
      return results;
    }

    const allSourceFiles = scanFiles(srcDir);
    expect(allSourceFiles.length).toBeGreaterThan(0);

    for (const file of allSourceFiles) {
      const content = fs.readFileSync(file, 'utf8');
      expect(
        content.includes('VITE_YOUTUBE_API_KEY'),
        `Forbidden secret exposure: VITE_YOUTUBE_API_KEY found in ${file}`
      ).toBe(false);
    }
  });

  it('validates that YouTube API service returns clean error codes without leaking stack traces or internal secrets', async () => {
    const { searchYouTube } = await import('../../server/youtubeService.js');

    // Calling search without API key configured returns safe configuration error
    const res = await searchYouTube('test query', 5);
    expect(res).toBeDefined();
    if (!res.configured) {
      expect(res.message).toContain('YouTube Data API key is not configured');
      // Must not expose any stack trace or internal paths
      expect(res.message).not.toContain('C:');
      expect(res.message).not.toContain('node_modules');
    }
  });
});
