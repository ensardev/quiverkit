import type { ReactNode } from 'react'
import { Trans, useTranslation } from 'react-i18next'
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
       * The wordmark and the links now live in the top bar, so the footer is
       * just the licence and the credit.
       */}
      <Outbound href={LINKS.licence} className="hover:underline">
        {t('footer.licence')}
      </Outbound>

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
    </footer>
  )
}
