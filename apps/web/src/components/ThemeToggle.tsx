import { useState } from 'react'
import { useTranslation } from 'react-i18next'

const THEMES = ['light', 'dark', 'retro'] as const

type Theme = (typeof THEMES)[number]

const STORAGE_KEY = 'quiverkit.theme'

function currentTheme(): Theme {
  const stored = document.documentElement.dataset.theme
  return THEMES.find((theme) => theme === stored) ?? 'light'
}

const ICONS: Record<Theme, React.ReactNode> = {
  light: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2m0 16v2M2 12h2m16 0h2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </>
  ),
  dark: <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />,
  retro: (
    <>
      <rect x="2.5" y="4" width="19" height="13" rx="1.5" />
      <path d="M8 21h8M12 17v4M6 8h4M6 11h7" />
    </>
  ),
}

export default function ThemeToggle() {
  const { t } = useTranslation()
  // The inline script in index.html already picked a theme before first paint;
  // we only mirror it into state so the icon stays in sync.
  const [theme, setTheme] = useState<Theme>(currentTheme)

  function cycle() {
    const next = THEMES[(THEMES.indexOf(theme) + 1) % THEMES.length] as Theme
    document.documentElement.dataset.theme = next
    localStorage.setItem(STORAGE_KEY, next)
    setTheme(next)
  }

  const label = t('theme.switchTo', { theme: t(`theme.name.${THEMES[(THEMES.indexOf(theme) + 1) % THEMES.length]}`) })

  return (
    <button
      type="button"
      onClick={cycle}
      title={label}
      aria-label={label}
      className="text-muted hover:text-ink hover:bg-hover cursor-pointer rounded-lg p-2 transition-colors"
    >
      <svg
        viewBox="0 0 24 24"
        width="16"
        height="16"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {ICONS[theme]}
      </svg>
    </button>
  )
}
