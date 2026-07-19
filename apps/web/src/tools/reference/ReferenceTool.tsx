import { findMimeTypes, findStatuses, type StatusClass } from '@quiverkit/core'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Panel, SegmentedControl, ToolShell } from '@/components/ui'

type Tab = 'status' | 'mime'

const GROUP_STYLES: Record<StatusClass, string> = {
  informational: 'bg-sky-500/15 text-sky-700 dark:text-sky-300',
  success: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
  redirect: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
  clientError: 'bg-orange-500/15 text-orange-700 dark:text-orange-300',
  serverError: 'bg-red-500/15 text-red-700 dark:text-red-300',
}

export default function ReferenceTool() {
  const { t } = useTranslation()
  const [tab, setTab] = useState<Tab>('status')
  const [query, setQuery] = useState('')

  const statuses = useMemo(() => findStatuses(query), [query])
  const mimeTypes = useMemo(() => findMimeTypes(query), [query])

  return (
    <ToolShell id="reference">
      <div className="flex flex-wrap items-center gap-3">
        <SegmentedControl
          value={tab}
          onChange={setTab}
          options={[
            { value: 'status', label: t('tools.reference.statuses') },
            { value: 'mime', label: t('tools.reference.mimeTypes') },
          ]}
        />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={tab === 'status' ? '404' : 'json'}
          className="border-line bg-surface placeholder:text-muted focus:border-accent min-w-48 flex-1 rounded-lg border px-3 py-2 text-sm transition-colors focus:outline-none"
        />
      </div>

      <Panel label={tab === 'status' ? t('tools.reference.statuses') : t('tools.reference.mimeTypes')}>
        <div className="max-h-[32rem] overflow-auto">
          {tab === 'status'
            ? statuses.map((status) => (
                <div
                  key={status.code}
                  className="border-line flex items-center gap-4 border-b px-4 py-2.5 last:border-b-0"
                >
                  <span className="w-12 shrink-0 font-mono text-sm font-semibold">{status.code}</span>
                  <span className="flex-1 text-sm">{status.phrase}</span>
                  <span
                    className={`shrink-0 rounded px-2 py-0.5 text-xs font-medium ${GROUP_STYLES[status.group]}`}
                  >
                    {t(`tools.reference.group.${status.group}`)}
                  </span>
                </div>
              ))
            : mimeTypes.map((mime) => (
                <div
                  key={mime.type}
                  className="border-line flex items-center gap-4 border-b px-4 py-2.5 last:border-b-0"
                >
                  <span className="flex-1 font-mono text-sm">{mime.type}</span>
                  <span className="text-muted shrink-0 font-mono text-xs">
                    {mime.extensions.map((extension) => `.${extension}`).join(' ') || '—'}
                  </span>
                </div>
              ))}

          {(tab === 'status' ? statuses : mimeTypes).length === 0 && (
            <p className="text-muted px-4 py-6 text-center text-sm">
              {t('nav.noResults', { query })}
            </p>
          )}
        </div>
      </Panel>
    </ToolShell>
  )
}
