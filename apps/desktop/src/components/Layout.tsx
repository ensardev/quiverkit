import { useCallback, useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Titlebar from './Titlebar'
import CommandPalette from '@/components/CommandPalette'

const WEBSITE = 'https://quiverkit.dev'
const AUTHOR = 'https://ensar.dev'
const REPO = 'https://github.com/ensardev/quiverkit'

/**
 * The credit line wraps a link, so it cannot be a single translated string
 * without markup in the translation. Splitting it in two lets each language put
 * "ensar.dev" where its grammar wants it — Turkish needs it first, English and
 * Spanish need it last.
 *
 * Kept local to the desktop app rather than added to the shared locale files:
 * this footer only exists here. Same approach as the dim-theme label.
 */
const CREDIT: Record<string, readonly [before: string, after: string]> = {
  en: ['Built by ', ''],
  tr: ['', ' tarafından geliştirildi'],
  es: ['Desarrollado por ', ''],
}

/** Opens in the user's real browser instead of navigating the app's webview. */
function ExternalLink({
  href,
  label,
  className,
  children,
}: {
  href: string
  label: string
  className?: string
  children: React.ReactNode
}) {
  const open = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault()
      import('@tauri-apps/plugin-opener')
        .then(({ openUrl }) => openUrl(href))
        .catch(() => {
          // Browser dev mode — no Tauri shell to hand the URL to.
          window.open(href, '_blank', 'noopener')
        })
    },
    [href],
  )

  return (
    <a
      href={href}
      onClick={open}
      title={label}
      aria-label={label}
      className={`cursor-pointer transition-colors ${className ?? ''}`}
    >
      {children}
    </a>
  )
}

function useAppVersion() {
  const [version, setVersion] = useState('')

  useEffect(() => {
    void import('@tauri-apps/api/app')
      .then(({ getVersion }) => getVersion())
      .then(setVersion)
      .catch(() => {
        // Browser dev mode — leave it blank rather than inventing a number.
      })
  }, [])

  return version
}

export default function DesktopLayout() {
  const { i18n } = useTranslation()
  const version = useAppVersion()
  const [before, after] = CREDIT[i18n.language] ?? CREDIT.en!

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <Titlebar />

      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>

      <footer className="border-line bg-surface text-muted flex shrink-0 items-center justify-between gap-4 border-t px-4 py-1.5 text-xs">
        <span className="flex items-baseline gap-1.5">
          <span className="text-ink/70 font-medium">QuiverKit</span>
          {version && <span className="font-mono text-[10px] opacity-60">{version}</span>}
        </span>

        <div className="flex items-center gap-2.5">
          <span>
            {before}
            <ExternalLink
              href={AUTHOR}
              label={AUTHOR}
              className="hover:text-ink underline decoration-dotted underline-offset-2"
            >
              ensar.dev
            </ExternalLink>
            {after}
          </span>

          <span aria-hidden className="opacity-40">
            ·
          </span>

          <ExternalLink href={WEBSITE} label="quiverkit.dev" className="hover:text-ink flex p-0.5">
            <svg
              viewBox="0 0 24 24"
              width="14"
              height="14"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="9" />
              <path d="M3 12h18M12 3a15 15 0 0 1 0 18a15 15 0 0 1 0-18" />
            </svg>
          </ExternalLink>

          <ExternalLink href={REPO} label="GitHub" className="hover:text-ink flex p-0.5">
            <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.4 7.4 0 0 1 2-.27c.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
            </svg>
          </ExternalLink>
        </div>
      </footer>

      <CommandPalette />
    </div>
  )
}
