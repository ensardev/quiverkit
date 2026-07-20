import { useTranslation } from 'react-i18next'
import { NavLink } from 'react-router-dom'
import { DownloadIcon, GitHubIcon } from '@/components/icons'
import LanguagePicker from '@/components/LanguagePicker'
import ThemeToggle from '@/components/ThemeToggle'
import { LINKS } from '@/links'

/**
 * The single full-width bar across the top. It carries the wordmark on the left
 * — the sidebar no longer owns a header of its own — and every cross-app control
 * on the right, so the top of the app reads as one strip rather than a sidebar
 * cell butting against a separate navbar.
 */
export default function TopBar() {
  const { t } = useTranslation()

  return (
    <header className="border-line bg-surface flex h-12 shrink-0 items-center gap-1 border-b pr-2 pl-4">
      <NavLink to="/" className="flex items-baseline gap-1.5">
        <span className="text-lg font-semibold tracking-tight">Quiver</span>
        <span className="text-accent text-lg font-semibold tracking-tight">Kit</span>
      </NavLink>

      <div className="flex-1" />

      <NavLink
        to="/download"
        className={({ isActive }) =>
          `flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium transition-colors ${
            isActive ? 'bg-accent-soft text-accent' : 'text-muted hover:text-ink hover:bg-hover'
          }`
        }
      >
        <DownloadIcon />
        {t('nav.download')}
      </NavLink>

      <a
        href={LINKS.repo}
        target="_blank"
        rel="noopener noreferrer"
        title={t('footer.sourceCode')}
        aria-label={t('footer.sourceCode')}
        className="text-muted hover:text-ink hover:bg-hover flex rounded-lg p-2 transition-colors"
      >
        <GitHubIcon />
      </a>

      <span aria-hidden className="bg-line mx-1 h-5 w-px" />

      <LanguagePicker />
      <ThemeToggle />
    </header>
  )
}
