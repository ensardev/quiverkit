import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { Outlet } from 'react-router-dom'
import { Trans, useTranslation } from 'react-i18next'
import Titlebar from './Titlebar'
import CommandPalette from '@/components/CommandPalette'
import { GitHubIcon, GlobeIcon } from '@/components/icons'
import { LINKS } from '@/links'

/**
 * Hands the URL to the user's real browser. Without this a click would navigate
 * the app's own webview and strand them in a browserless window.
 */
function Outbound({
  href,
  label,
  className,
  children,
}: {
  href: string
  label?: string
  className?: string
  children?: ReactNode
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
      className={`hover:text-ink cursor-pointer transition-colors ${className ?? ''}`}
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
  const { t } = useTranslation()
  const version = useAppVersion()

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
            <Trans
              i18nKey="footer.builtBy"
              components={{
                author: (
                  <Outbound
                    href={LINKS.author}
                    className="underline decoration-dotted underline-offset-2"
                  />
                ),
              }}
            />
          </span>

          <span aria-hidden className="opacity-40">
            ·
          </span>

          <Outbound href={LINKS.website} label="quiverkit.dev" className="flex p-0.5">
            <GlobeIcon />
          </Outbound>

          <Outbound href={LINKS.repo} label={t('footer.sourceCode')} className="flex p-0.5">
            <GitHubIcon />
          </Outbound>
        </div>
      </footer>

      <CommandPalette />
    </div>
  )
}
