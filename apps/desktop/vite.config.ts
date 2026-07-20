import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    // Same leading-slash trick as the web config — resolved against this
    // project root — but pointed one level up at apps/web/src, so `@/…` imports
    // reach the shared UI without either app depending on Node path helpers.
    alias: { '@': '/../web/src' },
  },
  server: {
    port: 1420,
    strictPort: true,
  },
})
