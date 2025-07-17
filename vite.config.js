import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true,
        type: 'module'
      },
      manifest: {
        name: 'Ark',
        short_name: 'Ark',
        start_url: '/',
        display: 'standalone',
        background_color: '#000000',
        theme_color: '#111111',
        icons: [
          {
            src: '/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        navigateFallback: '/index.html',
        navigateFallbackAllowlist: [
          /^\/$/, 
          /^\/files\//, 
          /^\/api\//,
          /^\/notes\//   // Add other routes you proxy too
        ]
      }
    })
  ],
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    allowedHosts: ['zenmaster', 'localhost', '127.0.0.1', 'zenmaster.coydog-parore.ts.net']
  }
});
