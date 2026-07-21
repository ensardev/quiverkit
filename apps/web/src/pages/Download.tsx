import type { ReactNode } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { CHANGELOG } from '@/changelog'
import { DownloadIcon, LinuxIcon, MonitorIcon, PuzzleIcon, WindowsIcon } from '@/components/icons'
import { CopyButton } from '@/components/ui'
import { DESKTOP_VERSION, DOWNLOADS, PACKAGE_MANAGERS } from '@/downloads'
import { LINKS } from '@/links'

function AlertIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
      <path d="M12 9v4m0 4h.01" />
    </svg>
  )
}

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

/** One package-manager entry: a name, its copyable install command, and a hint.
 * Full-width inside the install card, so even the long Scoop URL wraps rather
 * than forcing a horizontal scrollbar. */
function CommandBlock({
  name,
  command,
  hint,
}: {
  name: string
  command: string
  hint: string
}) {
  return (
    <div>
      <div className="border-line bg-sunken rounded-lg border px-3 py-2">
        <div className="mb-1.5 flex items-center justify-between gap-2">
          <span className="text-muted text-xs font-medium">{name}</span>
          <CopyButton value={command} />
        </div>
        <pre className="text-ink font-mono text-xs leading-relaxed break-all whitespace-pre-wrap">
          {command}
        </pre>
      </div>
      <p className="text-muted mt-1.5 text-xs">{hint}</p>
    </div>
  )
}

/** A small pill link for the less-common installer formats. */
function FormatLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="border-line hover:border-accent hover:text-ink rounded-full border px-2 py-0.5 transition-colors"
    >
      {label}
    </a>
  )
}

export default function Download() {
  const { t, i18n } = useTranslation()
  const formatDate = new Intl.DateTimeFormat(i18n.language, { dateStyle: 'medium' })

  return (
    <div className="mx-auto w-full max-w-4xl p-6 lg:p-10">
      <header className="border-line border-b pb-8">
        <h1 className="max-w-2xl text-3xl font-semibold tracking-tight lg:text-4xl">
          {t('download.title')}
        </h1>
        <p className="text-muted mt-3 max-w-2xl text-base">{t('download.subtitle')}</p>
      </header>

      <div className="mt-8 grid gap-5 md:grid-cols-2">
        {/* Desktop — the two most common installers get buttons; the rest are
            small links below, and every file lives on the GitHub release. */}
        <section className="border-line bg-surface flex flex-col rounded-2xl border p-6">
          <div className="text-accent mb-3">
            <MonitorIcon size={24} />
          </div>
          <h2 className="text-lg font-semibold tracking-tight">{t('download.desktop.name')}</h2>
          <p className="text-muted mt-1 text-sm">{t('download.desktop.tagline')}</p>

          <div className="mt-5 space-y-2.5">
            <PlatformButton
              href={DOWNLOADS.exe}
              icon={<WindowsIcon />}
              label={t('download.desktop.windows')}
              hint={t('download.desktop.windowsHint')}
            />
            <PlatformButton
              href={DOWNLOADS.deb}
              icon={<LinuxIcon />}
              label={t('download.desktop.linux')}
              hint={t('download.desktop.linuxHint')}
            />
          </div>

          {/* The two most common formats get buttons; the rest sit here as
              small links so every artefact is reachable without five buttons. */}
          <div className="text-muted mt-3 flex flex-wrap items-center gap-2 text-xs">
            <span>{t('download.desktop.more')}</span>
            <FormatLink href={DOWNLOADS.msi} label="MSI" />
            <FormatLink href={DOWNLOADS.rpm} label="RPM" />
            <FormatLink href={DOWNLOADS.appimage} label="AppImage" />
          </div>

          <p className="text-muted mt-4 text-xs">v{DESKTOP_VERSION}</p>
        </section>

        {/* Extension — live on the Chrome Web Store; the button installs it. */}
        <section className="border-line bg-surface flex flex-col rounded-2xl border p-6">
          <div className="text-accent mb-3">
            <PuzzleIcon size={24} />
          </div>
          <h2 className="text-lg font-semibold tracking-tight">{t('download.extension.name')}</h2>
          <p className="text-muted mt-1 text-sm">{t('download.extension.tagline')}</p>

          <div className="mt-5">
            <a
              href={LINKS.extension}
              target="_blank"
              rel="noopener noreferrer"
              className="border-line hover:border-accent hover:bg-hover group flex items-center gap-3 rounded-xl border px-4 py-3 transition-colors"
            >
              <span className="text-muted group-hover:text-ink transition-colors">
                <PuzzleIcon />
              </span>
              <span className="flex-1 text-left text-sm font-medium">
                {t('download.extension.store')}
              </span>
              <DownloadIcon />
            </a>
          </div>

          <p className="text-muted mt-4 text-xs">{t('download.extension.note')}</p>
        </section>
      </div>

      {/* Package managers — one full-width card under the two above, with winget
          stacked over Scoop so each command spans the full width and the long
          Scoop URL wraps instead of scrolling. The bucket is live; winget
          resolves once the winget-pkgs listing is merged. */}
      <section className="border-line bg-surface mt-5 rounded-2xl border p-6">
        <h2 className="text-lg font-semibold tracking-tight">{t('download.desktop.pkg')}</h2>
        <div className="mt-4 space-y-4">
          <CommandBlock
            name="winget"
            command={PACKAGE_MANAGERS.winget}
            hint={t('download.desktop.pkgWinget')}
          />
          <CommandBlock
            name="Scoop"
            command={PACKAGE_MANAGERS.scoop}
            hint={t('download.desktop.pkgScoop')}
          />
        </div>
      </section>

      {/* Install caveats — chiefly that the builds are unsigned, so Windows and
          Linux each need a small manual step to get past their gatekeepers. */}
      <section className="border-line bg-sunken mt-5 rounded-xl border p-4">
        <h2 className="mb-2 flex items-center gap-2 text-sm font-medium">
          <span className="text-accent">
            <AlertIcon />
          </span>
          {t('download.notes.title')}
        </h2>
        <ul className="text-muted space-y-1.5 text-xs">
          <li className="flex items-start gap-2">
            <span className="mt-0.5 shrink-0">
              <WindowsIcon size={13} />
            </span>
            {t('download.notes.windows')}
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 shrink-0">
              <LinuxIcon size={13} />
            </span>
            {t('download.notes.linux')}
          </li>
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="mb-4 text-lg font-semibold tracking-tight">
          {t('download.changelog.title')}
        </h2>
        <ol className="space-y-6">
          {CHANGELOG.map((release) => (
            <li key={release.version} className="border-line border-l-2 pl-4">
              <div className="flex items-baseline gap-3">
                <span className="font-mono text-sm font-medium">v{release.version}</span>
                <span className="text-muted text-xs">
                  {formatDate.format(new Date(release.date))}
                </span>
              </div>
              <ul className="text-muted mt-2 space-y-1 text-sm">
                {release.changes.map((change) => (
                  <li key={change} className="flex gap-2">
                    <span className="text-accent shrink-0">•</span>
                    {change}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </section>

      <p className="text-muted mt-10 text-sm">
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
