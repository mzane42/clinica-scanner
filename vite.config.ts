import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { VitePWA, type VitePWAOptions } from 'vite-plugin-pwa'
import path from 'path'

const pwaOptions: Partial<VitePWAOptions> = {
  registerType: 'autoUpdate',
  includeAssets: ['favicon.svg', 'icon-192.png', 'icon-512.png'],
  manifest: {
    name: 'CLINICA EXPO 2026 Scanner',
    short_name: 'CLINICA EXPO',
    description: 'Scanner de badges pour CLINICA EXPO 2026',
    start_url: '/',
    display: 'standalone',
    background_color: '#0f172a',
    theme_color: '#059669',
    orientation: 'portrait',
    icons: [
      {
        src: 'icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: 'icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: 'icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  },
  workbox: {
    globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
  },
  devOptions: {
    enabled: false,
  },
}

export default defineConfig({
  plugins: [
    react(),
    VitePWA(pwaOptions),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5174,
    host: true,
  },
})
