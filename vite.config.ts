import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'
// @ts-ignore
import { createYouTubeMiddleware } from './server/middleware.js'

function youtubeBackendPlugin() {
  return {
    name: 'sonora-youtube-backend',
    configureServer(server: any) {
      server.middlewares.use(createYouTubeMiddleware());
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), youtubeBackendPlugin()],
  test: {
    globals: true,
    environment: 'jsdom',
  },
})
