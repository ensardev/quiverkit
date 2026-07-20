// First import on purpose: it sets the theme before React paints anything.
import './theme'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App'
import { initI18n } from '@/i18n'
import './index.css'

const container = document.getElementById('root')
if (!container) throw new Error('Missing #root element')

// Translations are awaited before the first render, so the UI never flashes
// English at someone whose browser is set to another language.
await initI18n()

createRoot(container).render(
  <StrictMode>
    {/* Hash routing: the panel is served from a chrome-extension:// URL, where
        there is no server to resolve real paths against. */}
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>,
)
