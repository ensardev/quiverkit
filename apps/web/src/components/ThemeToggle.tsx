import { useState } from 'react'
import { useTranslation } from 'react-i18next'

type Theme = 'light' | 'dark'

const STORAGE_KEY = 'quiverkit.theme'

function currentTheme(): Theme {
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'
}

export default function ThemeToggle() {
  const { t } = useTranslation()
  // The inline script in index.html already picked a theme before first paint;
  // we only mirror it into state so the icon stays in sync.
  const [theme, setTheme] = useState<Theme>(currentTheme)

  function toggle() {
    const next: Theme = theme === 'dark' ? 'light' : 'dark'
    document.documentElement.dataset.theme = next
    localStorage.setItem(STORAGE_KEY, next)
    setTheme(next)
  }

  return (
    <button
      type="button"
      onClick={toggle}
      title={t('theme.toggle')}
      aria-label={t('theme.toggle')}
      className="text-muted hover:text-ink hover:bg-hover cursor-pointer rounded-lg p-2 transition-colors"
    >
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        {theme === 'dark' ? (
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
        ) : (
          <>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2m0 16v2M2 12h2m16 0h2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
          </>
        )}
      </svg>
    </button>
  )
}
