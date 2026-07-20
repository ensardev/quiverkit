import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { NetworkBadge } from '@/components/ui'
import { TOOLS, type Tool } from '@/tools/registry'

const MAX_RESULTS = 8

interface Scored {
  tool: Tool
  score: number
}

/**
 * Ranks by how the match was found, not just whether it matched: a name that
 * starts with what you typed beats one that merely contains it, and both beat a
 * keyword hit. Without this, typing "json" puts "JSON to Types" above "JSON
 * Formatter" purely by registry order.
 */
function score(tool: Tool, needle: string, name: string): number {
  if (needle === '') return 0

  if (name.startsWith(needle)) return 100 - name.length
  if (tool.id.toLowerCase().startsWith(needle)) return 90
  if (name.includes(needle)) return 60
  if (tool.id.toLowerCase().includes(needle)) return 50
  if (tool.keywords.some((keyword) => keyword.startsWith(needle))) return 40
  if (tool.keywords.some((keyword) => keyword.includes(needle))) return 20

  return -1
}

export default function CommandPalette() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const field = useRef<HTMLInputElement>(null)

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setOpen((current) => !current)
        return
      }

      if (event.key === 'Escape') setOpen(false)
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    if (open) {
      setQuery('')
      setActive(0)
      // The input only exists once the dialog is rendered.
      requestAnimationFrame(() => field.current?.focus())
    }
  }, [open])

  const results = useMemo(() => {
    // Turkish lowercases "I" to "ı", so the locale-aware form is what makes
    // typing "ıstanbul" or "JSON" behave the same as elsewhere in the app.
    const needle = query.trim().toLocaleLowerCase(i18n.language)

    const scored: Scored[] = TOOLS.map((tool) => ({
      tool,
      score: score(tool, needle, t(`tools.${tool.id}.name`).toLocaleLowerCase(i18n.language)),
    })).filter((entry) => entry.score >= 0)

    return scored
      .sort((left, right) => right.score - left.score)
      .slice(0, MAX_RESULTS)
      .map((entry) => entry.tool)
  }, [query, t, i18n.language])

  function choose(tool: Tool | undefined) {
    if (!tool) return
    setOpen(false)
    void navigate(`/${tool.id}`)
  }

  function onFieldKeyDown(event: React.KeyboardEvent) {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActive((current) => (current + 1) % Math.max(1, results.length))
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActive((current) => (current - 1 + results.length) % Math.max(1, results.length))
    }
    if (event.key === 'Enter') {
      event.preventDefault()
      choose(results[active])
    }
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4 pt-[12vh] backdrop-blur-sm"
      onClick={() => setOpen(false)}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t('palette.title')}
        onClick={(event) => event.stopPropagation()}
        className="border-line bg-surface w-full max-w-xl overflow-hidden rounded-xl border shadow-2xl"
      >
        <input
          ref={field}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value)
            setActive(0)
          }}
          onKeyDown={onFieldKeyDown}
          placeholder={t('palette.placeholder')}
          className="border-line placeholder:text-muted w-full border-b bg-transparent px-4 py-3.5 text-base focus:outline-none"
        />

        {results.length === 0 ? (
          <p className="text-muted px-4 py-6 text-center text-sm">
            {t('nav.noResults', { query })}
          </p>
        ) : (
          <ul className="max-h-80 overflow-y-auto p-2">
            {results.map((tool, index) => (
              <li key={tool.id}>
                <button
                  type="button"
                  onMouseEnter={() => setActive(index)}
                  onClick={() => choose(tool)}
                  className={`flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors ${
                    index === active ? 'bg-accent-soft text-accent' : 'hover:bg-hover'
                  }`}
                >
                  <span className="flex-1 truncate text-sm font-medium">
                    {t(`tools.${tool.id}.name`)}
                  </span>
                  {tool.network && <NetworkBadge compact />}
                  <span className="text-muted shrink-0 text-xs">
                    {t(`category.${tool.category}`)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="border-line text-muted flex items-center gap-4 border-t px-4 py-2 text-xs">
          <span>↑↓ {t('palette.navigate')}</span>
          <span>↵ {t('palette.open')}</span>
          <span>esc {t('palette.close')}</span>
        </div>
      </div>
    </div>
  )
}
