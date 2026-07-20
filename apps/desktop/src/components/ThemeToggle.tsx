import { useState } from 'react'
import { useTranslation } from 'react-i18next'

const THEMES = ['light', 'dim', 'dark'] as const
type Theme = (typeof THEMES)[number]

const STORAGE_KEY = 'quiverkit.theme'

function currentTheme(): Theme {
  const stored = document.documentElement.dataset.theme
  if (stored === 'retro') return 'dim' // migrate old retro preference
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
  dim: <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" opacity="0.45" />,
}

const DIM_LABELS: Record<string, string> = {
  en: 'Dim',
  tr: 'Loş',
  es: 'Tenue',
}

export default function ThemeToggle() {
  const { t, i18n } = useTranslation()
  const [theme, setTheme] = useState<Theme>(currentTheme)

  function cycle() {
    const index = THEMES.indexOf(theme)
    const next = THEMES[(index + 1) % THEMES.length] as Theme
    document.documentElement.dataset.theme = next
    localStorage.setItem(STORAGE_KEY, next)
    setTheme(next)
  }

  const nextTheme = THEMES[(THEMES.indexOf(theme) + 1) % THEMES.length] as Theme
  const name = nextTheme === 'dim' ? (DIM_LABELS[i18n.language] ?? 'Dim') : t(`theme.name.${nextTheme}`)
  const label = t('theme.switchTo', { theme: name })

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
