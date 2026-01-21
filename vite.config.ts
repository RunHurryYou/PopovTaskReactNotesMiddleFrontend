import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

import { VitePWA, type ManifestOptions } from 'vite-plugin-pwa'

const manifest: Partial<ManifestOptions> = {
  "theme_color": "#8936FF",
  "background_color": "#2EC6FE",
  "icons": [
    {
      "purpose": "maskable",
      "sizes": "512x512",
      "src": "/icon512_maskable.png",
      "type": "image/png"
    },
    {
      "purpose": "any",
      "sizes": "512x512",
      "src": "/icon512_rounded.png",
      "type": "image/png"
    }
  ],
  "orientation": "portrait",
  "display": "standalone",
  "lang": "ru-RU",
  "name": "MyNotes",
  "short_name": "MyNotes",
  "start_url": "/",
  "scope": "/"
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), VitePWA({
    registerType: 'autoUpdate',
    workbox: {
      globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
      navigateFallback: '/index.html',
    },
    manifest: manifest,
    includeAssets: ['icon512_maskable.png', 'icon512_rounded.png'],
  })],
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  base: './',
})
