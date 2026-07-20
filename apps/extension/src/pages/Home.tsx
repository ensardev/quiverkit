import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import Detector from '@/components/Detector'
import { NetworkBadge } from '@/components/ui'
import { CATEGORY_ORDER, TOOLS, type Tool } from '@/tools/registry'
import { onSelection, takePendingSelection } from '../selection'

export default function Home() {
  const { t, i18n } = useTranslation()
  const [selection, setSelection] = useState('')
  const [query, setQuery] = useState('')

  /*
   * Two ways the selection arrives: it was already waiting when the panel
   * opened, or it lands while the panel sits open and someone right-clicks
   * again. The detector takes it from here and offers the matching tools.
   */
  useEffect(() => {
    void takePendingSelection().then((text) => {
      if (text !== '') setSelection(text)
    })

    return onSelection(setSelection)
  }, [])

  const groups = useMemo(() => {
    // Turkish lowercases "I" to "ı", so the locale-aware form is what makes
    // typing "JSON" behave the same as it does elsewhere in the app.
    const needle = query.trim().toLocaleLowerCase(i18n.language)

    const matches = (tool: Tool) => {
      if (needle === '') return true
      const name = t(`tools.${tool.id}.name`).toLocaleLowerCase(i18n.language)
      return (
        name.includes(needle) ||
        tool.id.toLowerCase().includes(needle) ||
        tool.keywords.some((keyword) => keyword.includes(needle))
      )
    }

    // 'detect' is the panel's own header — listing it again would just point at
    // the box directly above.
    return CATEGORY_ORDER.filter((category) => category !== 'detect')
      .map((category) => ({
        category,
        tools: TOOLS.filter((tool) => tool.category === category && matches(tool)),
      }))
      .filter((group) => group.tools.length > 0)
  }, [query, t, i18n.language])

  return (
    <div className="p-3">
      <section className="space-y-2">
        <h1 className="px-1 text-sm font-semibold tracking-tight">{t('detector.title')}</h1>
        <Detector rows={3} initialValue={selection} />
      </section>

      <section className="mt-5">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t('nav.search')}
          aria-label={t('nav.search')}
          spellCheck={false}
          className="border-line bg-sunken placeholder:text-muted focus:border-accent w-full rounded-lg border px-3 py-2 text-sm transition-colors focus:outline-none"
        />

        {groups.length === 0 ? (
          <p className="text-muted px-1 py-6 text-center text-sm">
            {t('nav.noResults', { query })}
          </p>
        ) : (
          groups.map(({ category, tools }) => (
            <div key={category}>
              <h2 className="text-muted mt-4 mb-1.5 px-1 text-[11px] font-semibold tracking-wide uppercase">
                {t(`category.${category}`)}
              </h2>
              <ul className="space-y-1">
                {tools.map((tool) => (
                  <li key={tool.id}>
                    <Link
                      to={`/${tool.id}`}
                      className="border-line bg-surface hover:border-accent flex items-center gap-2 rounded-lg border px-3 py-2 transition-colors"
                    >
                      <span className="min-w-0 flex-1 truncate text-sm">
                        {t(`tools.${tool.id}.name`)}
                      </span>
                      {tool.network && <NetworkBadge compact />}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </section>
    </div>
  )
}
