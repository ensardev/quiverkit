import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import CommandPalette from '@/components/CommandPalette'
import LanguagePicker from '@/components/LanguagePicker'
import ThemeToggle from '@/components/ThemeToggle'
import { findTool } from '@/tools/registry'

/**
 * A side panel starts around 320px, so there is no room for the sidebar the web
 * and desktop builds navigate with. The header does that job instead: at the
 * root it is the wordmark, and inside a tool it becomes a back button carrying
 * the tool's name.
 */
export default function PanelLayout() {
  const { t } = useTranslation()
  const { pathname } = useLocation()
  const navigate = useNavigate()

  const tool = findTool(pathname.slice(1))

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <header className="border-line bg-surface flex shrink-0 items-center gap-1 border-b px-2 py-1.5">
        {tool === undefined ? (
          <Link to="/" className="flex items-baseline gap-1 px-1">
            <span className="text-sm font-semibold tracking-tight">Quiver</span>
            <span className="text-accent text-sm font-semibold tracking-tight">Kit</span>
          </Link>
        ) : (
          <>
            <button
              type="button"
              onClick={() => navigate('/')}
              title={t('nav.back')}
              aria-label={t('nav.back')}
              className="text-muted hover:text-ink hover:bg-hover shrink-0 cursor-pointer rounded-lg p-1.5 transition-colors"
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
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <span className="truncate text-sm font-medium">{t(`tools.${tool.id}.name`)}</span>
          </>
        )}

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
