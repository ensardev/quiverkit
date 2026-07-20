import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { NavLink, useLocation } from 'react-router-dom'
import LanguagePicker from '@/components/LanguagePicker'
import ThemeToggle from '@/components/ThemeToggle'
import { NetworkBadge } from '@/components/ui'
import { CATEGORY_ORDER, findTool, TOOLS, type Tool, type ToolCategory } from '@/tools/registry'

const STORAGE_KEY = 'quiverkit.openCategories'

function readStored(): ToolCategory[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as ToolCategory[]) : null
  } catch {
    return null
  }
}

export default function Sidebar() {
  const { t, i18n } = useTranslation()
  const { pathname } = useLocation()
  const [query, setQuery] = useState('')
  const searchInput = useRef<HTMLInputElement>(null)

  const activeCategory = findTool(pathname.slice(1))?.category

  // With ten categories and forty-odd tools, showing everything at once turns
  // the sidebar into a wall. Only the section you are working in starts open,
  // and whatever you open after that is remembered.
  const [open, setOpen] = useState<ToolCategory[]>(
    () => readStored() ?? (activeCategory ? [activeCategory] : []),
  )

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(open))
  }, [open])

  useEffect(() => {
    if (activeCategory) setOpen((current) => (current.includes(activeCategory) ? current : [...current, activeCategory]))
  }, [activeCategory])

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

  const searching = query.trim() !== ''

  const groups = useMemo(() => {
    // Turkish lowercases "I" to "ı", not "i". Using the locale-aware variant is
    // the difference between "JSON" being findable and not.
    const needle = query.trim().toLocaleLowerCase(i18n.language)

    const matches = (tool: Tool) => {
      if (!needle) return true
      const name = t(`tools.${tool.id}.name`).toLocaleLowerCase(i18n.language)
      return (
        name.includes(needle) ||
        tool.id.toLowerCase().includes(needle) ||
        tool.keywords.some((keyword) => keyword.includes(needle))
      )
    }

    return CATEGORY_ORDER.map((category: ToolCategory) => ({
      category,
      tools: TOOLS.filter((tool) => tool.category === category && matches(tool)),
      total: TOOLS.filter((tool) => tool.category === category).length,
    })).filter((group) => group.tools.length > 0)
  }, [query, t, i18n.language])

  function toggle(category: ToolCategory) {
    setOpen((current) =>
      current.includes(category)
        ? current.filter((entry) => entry !== category)
        : [...current, category],
    )
  }

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
          groups.map((group) => {
            // A search has to reveal what it found, whatever was collapsed.
            const expanded = searching || open.includes(group.category)

            return (
              <div key={group.category} className="mb-1">
                <button
                  type="button"
                  onClick={() => toggle(group.category)}
                  aria-expanded={expanded}
                  className="text-muted hover:text-ink hover:bg-hover flex w-full cursor-pointer items-center gap-1.5 rounded-lg px-1.5 py-1.5 text-xs font-semibold tracking-wide uppercase transition-colors"
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="12"
                    height="12"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`shrink-0 transition-transform ${expanded ? 'rotate-90' : ''}`}
                  >
                    <path d="M9 6l6 6-6 6" />
                  </svg>
                  <span className="flex-1 text-left">{t(`category.${group.category}`)}</span>
                  <span className="text-muted/60 font-mono text-[10px]">
                    {searching ? group.tools.length : group.total}
                  </span>
                </button>

                {expanded && (
                  <ul className="mt-0.5 space-y-0.5 pb-1">
                    {group.tools.map((tool) => (
                      <li key={tool.id}>
                        <NavLink
                          to={`/${tool.id}`}
                          className={({ isActive }) =>
                            `flex items-center gap-2 rounded-lg py-1.5 pr-3 pl-6 text-sm transition-colors ${
                              isActive
                                ? 'bg-accent-soft text-accent font-medium'
                                : 'text-muted hover:text-ink hover:bg-hover'
                            }`
                          }
                        >
                          <span className="truncate">{t(`tools.${tool.id}.name`)}</span>
                          {tool.network && <NetworkBadge compact />}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )
          })
        )}
      </nav>

      <footer className="border-line flex items-center justify-between border-t p-3">
        <LanguagePicker />
        <ThemeToggle />
      </footer>
    </aside>
  )
}
