import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import Detector from '@/components/Detector'
import { NetworkBadge } from '@/components/ui'
import { CATEGORY_ORDER, TOOLS } from '@/tools/registry'

export default function Home() {
  const { t } = useTranslation()

  return (
    <div className="mx-auto w-full max-w-7xl p-6 lg:p-10">
      <header className="border-line border-b pb-8">
        <span className="border-line text-muted mb-4 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium">
          <span className="bg-accent size-1.5 rounded-full" />
          {t('privacy.badge')}
        </span>
        <h1 className="max-w-2xl text-3xl font-semibold tracking-tight lg:text-4xl">
          {t('home.heading')}
        </h1>
        <p className="text-muted mt-3 max-w-2xl text-base">
          {t('home.subheading')}
        </p>
      </header>

      <section className="mt-8">
        <h2 className="mb-1 text-lg font-semibold tracking-tight">
          {t('detector.title')}
        </h2>
        <p className="text-muted mb-3 text-sm">{t('detector.subtitle')}</p>
        <Detector />
      </section>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {CATEGORY_ORDER.filter((cat) => cat !== 'detect').map((category) => {
          const tools = TOOLS.filter((t) => t.category === category)
          if (tools.length === 0) return null

          return (
            <section key={category}>
              <h2 className="text-muted mb-3 text-xs font-semibold tracking-wide uppercase">
                {t(`category.${category}`)}
              </h2>
              <ul className="space-y-1.5">
                {tools.map((tool) => (
                  <li key={tool.id}>
                    <Link
                      to={`/${tool.id}`}
                      className="border-line bg-surface hover:border-accent flex items-center gap-3 rounded-lg border px-3 py-2 transition-colors"
                    >
                      <span className="flex-1 truncate text-sm font-medium">
                        {t(`tools.${tool.id}.name`)}
                      </span>
                      {tool.network && <NetworkBadge compact />}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )
        })}
      </div>
    </div>
  )
}
