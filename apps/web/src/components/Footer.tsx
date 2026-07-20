import type { ReactNode } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { GitHubIcon, MonitorIcon } from '@/components/icons'
import { LINKS } from '@/links'

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
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title={label}
      aria-label={label}
      className={`hover:text-ink transition-colors ${className ?? ''}`}
    >
      {children}
    </a>
  )
}

export default function Footer() {
  const { t } = useTranslation()

  return (
    <footer className="border-line bg-surface text-muted flex shrink-0 items-center justify-between gap-4 border-t px-4 py-2 text-xs">
      {/*
       * Spanish is the widest of the three languages and the sidebar already
       * takes 256px, so the secondary bits drop away as the window narrows —
       * licence first, then the desktop-app wording, leaving its icon behind.
       */}
      <span className="flex items-baseline gap-2">
        <span className="text-ink/70 font-medium">QuiverKit</span>
        <Outbound href={LINKS.licence} className="hidden hover:underline lg:inline">
          {t('footer.licence')}
        </Outbound>
      </span>

      <div className="flex items-center gap-3">
        {/*
         * The credit wraps a link, so the sentence has to carry markup: Turkish
         * puts "ensar.dev" first and English puts it last, and <Trans> lets each
         * translation decide instead of hard-coding the word order here.
         */}
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

        <Outbound
          href={LINKS.releases}
          label={t('footer.desktopApp')}
          className="flex items-center gap-1.5"
        >
          <MonitorIcon />
          <span className="hidden md:inline">{t('footer.desktopApp')}</span>
        </Outbound>

        <Outbound href={LINKS.repo} label={t('footer.sourceCode')} className="flex p-0.5">
          <GitHubIcon />
        </Outbound>
      </div>
    </footer>
  )
}
