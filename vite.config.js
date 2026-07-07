import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // Precachear solo el shell de la app (JS/CSS/HTML): las ilustraciones y
      // audios pesan ~150MB y se cachean bajo demanda a medida que el niño lee.
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg}', 'logo.png', 'vani_avatar.png', 'pwa-192x192.png', 'pwa-512x512.png'],
        runtimeCaching: [
          {
            urlPattern: /\.(?:png|jpg|jpeg|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'vani-ilustraciones',
              expiration: { maxEntries: 300, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
          {
            urlPattern: /\.(?:mp3|json)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'vani-audios',
              expiration: { maxEntries: 150, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
        ],
      },
      manifest: {
        name: 'VANI Lectura Inmersiva',
        short_name: 'VANI',
        description: 'Serie de aventuras interactivas que acompaña a los niños a mejorar su lectura.',
        lang: 'es',
        start_url: '/',
        display: 'standalone',
        background_color: '#f7f3eb',
        theme_color: '#f7f3eb',
        orientation: 'any',
        icons: [
          { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
})
