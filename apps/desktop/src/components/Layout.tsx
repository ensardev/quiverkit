import { Outlet, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Titlebar from './Titlebar'
import CommandPalette from '@/components/CommandPalette'
import LanguagePicker from '@/components/LanguagePicker'
import ThemeToggle from './ThemeToggle'

export default function DesktopLayout() {
  const { t } = useTranslation()

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <Titlebar />

      <header className="border-line bg-surface flex shrink-0 items-center gap-3 border-b px-4 py-1.5">
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

      <footer className="border-line bg-surface flex shrink-0 items-center justify-center gap-4 border-t px-4 py-2 text-xs">
        <a
          href="https://ensar.dev"
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted hover:text-ink transition-colors"
        >
          ensar.dev
        </a>
        <a
          href="https://github.com/ensardev/quiverkit"
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted hover:text-ink transition-colors"
        >
          GitHub
        </a>
      </footer>

      <CommandPalette />
    </div>
  )
}
