import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import Detector from '@/components/Detector'
import { NetworkBadge } from '@/components/ui'
import { CATEGORY_ORDER, TOOLS } from '@/tools/registry'

export default function Home() {
  const { t } = useTranslation()

  return (
    <div className="mx-auto w-full max-w-5xl p-6 lg:p-10">
      <header className="border-line border-b pb-8">
        <span className="border-line text-muted mb-4 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium">
          <span className="bg-accent size-1.5 rounded-full" />
          {t('privacy.badge')}
        </span>
        <h1 className="max-w-2xl text-3xl font-semibold tracking-tight lg:text-4xl">
          {t('home.heading')}
        </h1>
        <p className="text-muted mt-3 max-w-2xl text-base">{t('home.subheading')}</p>
      </header>

      {/*
        The detector sits above the catalogue on purpose: pasting something and
        being told what it is skips the step of knowing which tool to look for,
        which is the part that actually slows people down.
      */}
      <section className="mt-8">
        <h2 className="mb-1 text-lg font-semibold tracking-tight">{t('detector.title')}</h2>
        <p className="text-muted mb-3 text-sm">{t('detector.subtitle')}</p>
        <Detector />
      </section>

      {CATEGORY_ORDER.filter((category) => category !== 'detect').map((category) => {
        const tools = TOOLS.filter((tool) => tool.category === category)
        if (tools.length === 0) return null

        return (
          <section key={category} className="mt-8">
            <h2 className="text-muted mb-3 text-xs font-semibold tracking-wide uppercase">
              {t(`category.${category}`)}
            </h2>
            <ul className="grid gap-3 sm:grid-cols-2">
              {tools.map((tool) => (
                <li key={tool.id}>
                  <Link
                    to={`/${tool.id}`}
                    className="border-line bg-surface hover:border-accent block h-full rounded-xl border p-4 transition-colors"
                  >
                    <h3 className="flex items-center gap-2 font-medium">
                      {t(`tools.${tool.id}.name`)}
                      {tool.network && <NetworkBadge compact />}
                    </h3>
                    <p className="text-muted mt-1 text-sm">{t(`tools.${tool.id}.description`)}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )
      })}
    </div>
  )
}
