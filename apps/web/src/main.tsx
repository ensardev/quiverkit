import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from '@/App'
import { initI18n } from '@/i18n'
import '@/index.css'

const container = document.getElementById('root')
if (!container) throw new Error('Missing #root element')

// Translations are awaited before the first render, so the UI never flashes
// English at someone whose browser is set to another language.
await initI18n()

createRoot(container).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)

// Registered only for the built site: in development the dev server should keep
// serving fresh modules rather than a cached copy of yesterday's build.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    void navigator.serviceWorker.register('/sw.js')
  })
}
