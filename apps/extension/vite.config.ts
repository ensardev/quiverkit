import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  // Relative asset URLs. The panel is loaded from chrome-extension://<id>/, so
  // absolute paths happen to resolve too, but relative ones also let the built
  // dist/ be opened from a plain static server for checking the UI.
  base: './',
  plugins: [react(), tailwindcss()],
  resolve: {
    // Same leading-slash trick as the web and desktop configs, pointed at the
    // shared UI in apps/web/src so `@/…` imports resolve without Node helpers.
    alias: { '@': '/../web/src' },
  },
  build: {
    rollupOptions: {
      input: {
        panel: 'panel.html',
        background: 'src/background.ts',
      },
      output: {
        /*
         * The manifest names background.js literally, so entry files cannot
         * carry a content hash. Chunks and assets still do — they are only ever
         * referenced by the generated HTML.
         */
        entryFileNames: '[name].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
  },
})
