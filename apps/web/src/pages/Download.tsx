import type { ReactNode } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { DownloadIcon, LinuxIcon, MonitorIcon, PuzzleIcon, WindowsIcon } from '@/components/icons'
import { LINKS } from '@/links'

/** One download target — a platform button with a leading glyph and a hint. */
function PlatformButton({
  href,
  icon,
  label,
  hint,
}: {
  href: string
  icon: ReactNode
  label: string
  hint: string
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="border-line hover:border-accent hover:bg-hover group flex items-center gap-3 rounded-xl border px-4 py-3 transition-colors"
    >
      <span className="text-muted group-hover:text-ink transition-colors">{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium">{label}</span>
        <span className="text-muted block text-xs">{hint}</span>
      </span>
      <DownloadIcon />
    </a>
  )
}

function SoonBadge() {
  const { t } = useTranslation()
  return (
    <span className="border-line text-muted rounded-full border px-2 py-0.5 text-xs font-medium">
      {t('download.soon')}
    </span>
  )
}

export default function Download() {
  const { t } = useTranslation()

  return (
    <div className="mx-auto w-full max-w-4xl p-6 lg:p-10">
      <header className="border-line border-b pb-8">
        <h1 className="max-w-2xl text-3xl font-semibold tracking-tight lg:text-4xl">
          {t('download.title')}
        </h1>
        <p className="text-muted mt-3 max-w-2xl text-base">{t('download.subtitle')}</p>
      </header>

      <div className="mt-8 grid gap-5 md:grid-cols-2">
        {/* Desktop — the builds are not published yet, so the buttons point at
            the releases page and a note says the artefacts are on the way. */}
        <section className="border-line bg-surface flex flex-col rounded-2xl border p-6">
          <div className="text-accent mb-3">
            <MonitorIcon size={24} />
          </div>
          <h2 className="text-lg font-semibold tracking-tight">{t('download.desktop.name')}</h2>
          <p className="text-muted mt-1 text-sm">{t('download.desktop.tagline')}</p>

          <div className="mt-5 space-y-2.5">
            <PlatformButton
              href={LINKS.releases}
              icon={<WindowsIcon />}
              label={t('download.desktop.windows')}
              hint={t('download.desktop.windowsHint')}
            />
            <PlatformButton
              href={LINKS.releases}
              icon={<LinuxIcon />}
              label={t('download.desktop.linux')}
              hint={t('download.desktop.linuxHint')}
            />
          </div>

          <p className="text-muted mt-4 text-xs">{t('download.desktop.note')}</p>
        </section>

        {/* Extension — not on any store yet, so everything here is disabled. */}
        <section className="border-line bg-surface flex flex-col rounded-2xl border p-6">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-accent">
              <PuzzleIcon size={24} />
            </span>
            <SoonBadge />
          </div>
          <h2 className="text-lg font-semibold tracking-tight">{t('download.extension.name')}</h2>
          <p className="text-muted mt-1 text-sm">{t('download.extension.tagline')}</p>

          <div className="mt-5">
            <button
              type="button"
              disabled
              className="border-line text-muted flex w-full cursor-not-allowed items-center gap-3 rounded-xl border px-4 py-3 opacity-60"
            >
              <PuzzleIcon />
              <span className="flex-1 text-left text-sm font-medium">
                {t('download.extension.store')}
              </span>
            </button>
          </div>

          <p className="text-muted mt-4 text-xs">{t('download.extension.note')}</p>
        </section>
      </div>

      <p className="text-muted mt-8 text-sm">
        <Trans
          i18nKey="download.webNote"
          components={{
            link: (
              <Link to="/" className="text-accent underline decoration-dotted underline-offset-2" />
            ),
          }}
        />
      </p>
    </div>
  )
}
