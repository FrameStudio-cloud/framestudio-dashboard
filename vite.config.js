import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.js',
      registerType: 'prompt',
      injectRegister: null,
      includeAssets: [
        'favicon.ico',
        'favicon-16x16.png',
        'favicon-32x32.png',
        'apple-touch-icon.png',
        'pwa-192x192.png',
        'pwa-512x512.png',
        'pwa-256x256.png',
        'badge-icon.png',
        'offline.html',
      ],
      manifest: {
        name: 'FrameStudio Admin',
        short_name: 'FrameStudio',
        description: 'Full-featured admin dashboard for FrameStudio — manage clients, finances, projects, and team operations.',
        id: '/',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        display_override: ['window-controls-overlay', 'minimal-ui', 'standalone'],
        orientation: 'portrait-primary',
        background_color: '#0f172a',
        theme_color: '#d97706',
        lang: 'en',
        dir: 'ltr',
        categories: ['business', 'productivity', 'utilities'],
        shortcuts: [
          {
            name: 'Dashboard',
            short_name: 'Home',
            url: '/',
            icons: [{ src: '/pwa-192x192.png', sizes: '192x192' }],
          },
          {
            name: 'Clients',
            short_name: 'Clients',
            url: '/clients',
            icons: [{ src: '/pwa-192x192.png', sizes: '192x192' }],
          },
          {
            name: 'Finances',
            short_name: 'Finance',
            url: '/finances',
            icons: [{ src: '/pwa-192x192.png', sizes: '192x192' }],
          },
          {
            name: 'Focus Board',
            short_name: 'Focus',
            url: '/focus',
            icons: [{ src: '/pwa-192x192.png', sizes: '192x192' }],
          },
        ],
        icons: [
          { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: '/pwa-256x256.png', sizes: '256x256', type: 'image/png' },
          { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
        ],
        screenshots: [
          {
            src: '/screenshot-desktop.png',
            sizes: '1280x800',
            type: 'image/png',
            form_factor: 'wide',
            label: 'FrameStudio Dashboard on desktop',
          },
          {
            src: '/screenshot-mobile.png',
            sizes: '390x844',
            type: 'image/png',
            form_factor: 'narrow',
            label: 'FrameStudio Dashboard on mobile',
          },
        ],
        prefer_related_applications: false,
        edge_side_panel: { preferred_width: 480 },
        launch_handler: {
          client_mode: ['navigate-existing', 'auto'],
        },
      },
      workbox: {
        globDirectory: 'dist',
        globPatterns: ['**/*.{js,css,html,woff2,woff,ttf,svg,png,ico,json}'],
        globIgnores: ['**/node_modules/**/*', 'sw.js', 'workbox-*.js'],
        injectionPoint: 'self.__WB_MANIFEST',
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
      },
      devOptions: {
        enabled: true,
        type: 'module',
        navigateFallback: 'index.html',
      },
    }),
  ],
})
