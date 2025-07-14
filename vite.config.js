import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true,      // <<< THIS enables manifest in dev
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
      }
    })
  ],
  server: {
    // https: {
    // key: './zenmaster-key.pem',
    // cert: './zenmaster.pem'
    // },
    host: true,
    port: 5173,
    strictPort: true,
    allowedHosts: ['zenmaster', 'localhost', '127.0.0.1', 'zenmaster.coydog-parore.ts.net']
  }
});
