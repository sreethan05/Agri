import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  // CRITICAL: This ensures all asset paths are relative (./) instead of absolute (/)
  // Without this, the Electron app will show a blank white screen.
  base: './', 
  
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon-192.png', 'icon-512.png'],
      manifest: {
        name: 'Agri AI',
        short_name: 'Agri',
        description: 'AI Plant Disease Detector for Farmers',
        theme_color: '#16a34a',
        background_color: '#f0fdf4',
        display: 'standalone',
        orientation: 'portrait',
        // Changed to '.' for local file compatibility
        start_url: '.', 
        icons: [
          {
            src: 'icon-192.png', // Removed leading slash
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icon-512.png', // Removed leading slash
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        globIgnores: [
          '**/win-unpacked/**', 
          '**/resources/**', 
        ]
      },
      devOptions: {
        enabled: false
      }
    })
  ],
  server: {
    host: '0.0.0.0',
    port: 5175,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api/, '')
      }
    }
  },
  // Added to ensure build output is clean and compatible
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  }
})
