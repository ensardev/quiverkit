import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    // A leading slash is resolved against the project root, which keeps this
    // config free of Node path helpers (and of `@types/node`).
    alias: { '@': '/src' },
  },
})
