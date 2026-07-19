import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
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

      {CATEGORY_ORDER.map((category) => {
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
                    <h3 className="font-medium">{t(`tools.${tool.id}.name`)}</h3>
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
