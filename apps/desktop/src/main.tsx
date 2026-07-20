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
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>,
)
