import { useEffect } from 'react'
import { Outlet, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import CommandPalette from '@/components/CommandPalette'
import LanguagePicker from '@/components/LanguagePicker'
import ThemeToggle from './ThemeToggle'

export default function DesktopLayout() {
  const { t } = useTranslation()

  // Listen for theme changes from the native OS menu (View › Light / Dark / Retro)
  useEffect(() => {
    let unlisten: (() => void) | undefined

    import('@tauri-apps/api/event')
      .then(({ listen }) => {
        listen<string>('menu-theme', (event) => {
          document.documentElement.dataset.theme = event.payload
          localStorage.setItem('quiverkit.theme', event.payload)
        }).then((fn) => {
          unlisten = fn
        })
      })
      .catch(() => {
        // Not running inside Tauri — no menu events to handle
      })

    return () => {
      unlisten?.()
    }
  }, [])

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <header className="border-line bg-surface flex shrink-0 items-center gap-3 border-b px-4 py-2">
        <Link to="/" className="flex items-baseline gap-1.5">
          <span className="text-sm font-semibold tracking-tight">Quiver</span>
          <span className="text-accent text-sm font-semibold tracking-tight">Kit</span>
        </Link>

        <span className="text-muted ml-2 hidden text-xs sm:inline">
          {t('palette.hint')}
        </span>

        <div className="flex-1" />

        <LanguagePicker />
        <ThemeToggle />
      </header>

      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>

      <CommandPalette />
    </div>
  )
}
