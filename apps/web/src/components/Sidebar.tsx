import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { NavLink } from 'react-router-dom'
import LanguagePicker from '@/components/LanguagePicker'
import ThemeToggle from '@/components/ThemeToggle'
import { CATEGORY_ORDER, TOOLS, type Tool, type ToolCategory } from '@/tools/registry'

export default function Sidebar() {
  const { t, i18n } = useTranslation()
  const [query, setQuery] = useState('')
  const searchInput = useRef<HTMLInputElement>(null)

  // "/" jumps to search, the convention every developer already knows from
  // GitHub and Slack. We bail out when the user is typing somewhere else.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement
      const typing = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA'
      if (event.key === '/' && !typing) {
        event.preventDefault()
        searchInput.current?.focus()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const groups = useMemo(() => {
    // Turkish lowercases "I" to "ı", not "i". Using the locale-aware variant is
    // the difference between "JSON" being findable and not.
    const needle = query.trim().toLocaleLowerCase(i18n.language)

    const matches = (tool: Tool) => {
      if (!needle) return true
      const name = t(`tools.${tool.id}.name`).toLocaleLowerCase(i18n.language)
      return (
        name.includes(needle) ||
        tool.id.includes(needle) ||
        tool.keywords.some((keyword) => keyword.includes(needle))
      )
    }

    return CATEGORY_ORDER.map((category: ToolCategory) => ({
      category,
      tools: TOOLS.filter((tool) => tool.category === category && matches(tool)),
    })).filter((group) => group.tools.length > 0)
  }, [query, t, i18n.language])

  return (
    <aside className="border-line bg-surface flex w-64 shrink-0 flex-col border-r">
      <div className="border-line border-b p-4">
        <NavLink to="/" className="flex items-baseline gap-1.5">
          <span className="text-lg font-semibold tracking-tight">Quiver</span>
          <span className="text-accent text-lg font-semibold tracking-tight">Kit</span>
        </NavLink>
      </div>

      <div className="p-3">
        <input
          ref={searchInput}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t('nav.search')}
          aria-label={t('nav.search')}
          className="border-line bg-sunken placeholder:text-muted focus:border-accent w-full rounded-lg border px-3 py-2 text-sm transition-colors focus:outline-none"
        />
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-3">
        {groups.length === 0 ? (
          <p className="text-muted px-1 py-4 text-sm">{t('nav.noResults', { query })}</p>
        ) : (
          groups.map((group) => (
            <div key={group.category} className="mb-4">
              <h2 className="text-muted px-1 pb-1.5 text-xs font-semibold tracking-wide uppercase">
                {t(`category.${group.category}`)}
              </h2>
              <ul className="space-y-0.5">
                {group.tools.map((tool) => (
                  <li key={tool.id}>
                    <NavLink
                      to={`/${tool.id}`}
                      className={({ isActive }) =>
                        `block rounded-lg px-3 py-1.5 text-sm transition-colors ${
                          isActive
                            ? 'bg-accent-soft text-accent font-medium'
                            : 'text-muted hover:text-ink hover:bg-hover'
                        }`
                      }
                    >
                      {t(`tools.${tool.id}.name`)}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </nav>

      <footer className="border-line flex items-center justify-between border-t p-3">
        <LanguagePicker />
        <ThemeToggle />
      </footer>
    </aside>
  )
}
