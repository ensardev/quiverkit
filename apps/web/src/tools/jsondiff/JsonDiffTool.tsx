import { diffJson, type JsonDiffEntry } from '@quiverkit/core'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CodeArea, ErrorNote, Panel, ToolShell } from '@/components/ui'

export default function JsonDiffTool() {
  const { t } = useTranslation()
  const [left, setLeft] = useState('')
  const [right, setRight] = useState('')

  const diffs: JsonDiffEntry[] | null = useMemo(() => {
    if (left === '' && right === '') return null
    const result = diffJson(left, right)
    if (!result.ok) return null
    return result.value
  }, [left, right])

  const leftError = useMemo(() => {
    if (left.trim() === '') return null
    try { JSON.parse(left); return null } catch { return 'error.invalidJson' }
  }, [left])

  const rightError = useMemo(() => {
    if (right.trim() === '') return null
    try { JSON.parse(right); return null } catch { return 'error.invalidJson' }
  }, [right])

  const kindLabel = (kind: string): string => {
    switch (kind) {
      case 'added': return t('tools.jsondiff.added')
      case 'removed': return t('tools.jsondiff.removed')
      case 'changed': return t('tools.jsondiff.changed')
      default: return kind
    }
  }

  return (
    <ToolShell id="jsondiff">
      <div className="grid flex-1 gap-4 lg:grid-cols-2">
        <Panel label={t('tools.jsondiff.left')} action={left !== '' && <button type="button" onClick={() => setLeft('')} className="text-muted hover:text-ink cursor-pointer text-xs font-medium transition-colors">{t('common.clear')}</button>}>
          <CodeArea value={left} onChange={setLeft} placeholder='{ "before": 1 }' />
          {leftError && <ErrorNote>{t(leftError)}</ErrorNote>}
        </Panel>

        <Panel label={t('tools.jsondiff.right')} action={right !== '' && <button type="button" onClick={() => setRight('')} className="text-muted hover:text-ink cursor-pointer text-xs font-medium transition-colors">{t('common.clear')}</button>}>
          <CodeArea value={right} onChange={setRight} placeholder='{ "after": 2 }' />
          {rightError && <ErrorNote>{t(rightError)}</ErrorNote>}
        </Panel>
      </div>

      {diffs && diffs.length === 0 && (
        <div className="bg-accent-soft text-accent rounded-lg px-4 py-3 text-sm">
          {t('tools.jsondiff.identical')}
        </div>
      )}

      {diffs && diffs.length > 0 && (
        <Panel label={t('tools.jsondiff.changes', { count: diffs.length })}>
          <div className="max-h-96 overflow-auto">
            {diffs.map((entry, index) => (
              <div
                key={index}
                className={`border-line flex items-start gap-3 border-b px-4 py-2 last:border-b-0 ${
                  entry.kind === 'added'
                    ? 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300'
                    : entry.kind === 'removed'
                      ? 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300'
                      : 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                }`}
              >
                <span className="shrink-0 text-xs font-semibold uppercase">
                  {kindLabel(entry.kind)}
                </span>
                <span className="font-mono text-sm font-medium">{entry.path}</span>
                <span className="text-muted flex-1 text-sm">
                  {entry.kind === 'changed' && (
                    <span>
                      {entry.left !== undefined && <span className="line-through">{JSON.stringify(entry.left)}</span>}
                      {' → '}
                      {entry.right !== undefined && <span>{JSON.stringify(entry.right)}</span>}
                    </span>
                  )}
                  {entry.kind === 'added' && entry.right !== undefined && (
                    <span>{JSON.stringify(entry.right)}</span>
                  )}
                  {entry.kind === 'removed' && entry.left !== undefined && (
                    <span className="line-through">{JSON.stringify(entry.left)}</span>
                  )}
                </span>
              </div>
            ))}
          </div>
        </Panel>
      )}

      {diffs === null && left !== '' && right !== '' && !leftError && !rightError && (
        <ErrorNote>{t('error.invalidJson')}</ErrorNote>
      )}
    </ToolShell>
  )
}
