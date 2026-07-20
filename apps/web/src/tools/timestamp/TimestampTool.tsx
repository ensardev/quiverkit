import { describeTimestamp, parseTimestamp } from '@quiverkit/core'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useToolInput } from '@/hooks/useToolInput'
import { Button, DataRow, ErrorNote, Panel, ToolShell } from '@/components/ui'

function unixNow(): string {
  return String(Math.floor(Date.now() / 1000))
}

export default function TimestampTool() {
  const { t, i18n } = useTranslation()
  const { value: input, setValue: setInput } = useToolInput(unixNow())

  const result = useMemo(() => parseTimestamp(input), [input])

  const rows = useMemo(() => {
    if (!result.ok) return null

    const view = describeTimestamp(result.value)

    // Core handed us `{ amount: -3, unit: 'day' }` and stayed out of wording.
    // Intl turns that into "3 days ago", "hace 3 días" or "3 gün önce".
    const relative = new Intl.RelativeTimeFormat(i18n.language, { numeric: 'auto' }).format(
      view.relative.amount,
      view.relative.unit,
    )

    const local = new Intl.DateTimeFormat(i18n.language, {
      dateStyle: 'full',
      timeStyle: 'long',
    }).format(result.value)

    return { view, relative, local }
  }, [result, i18n.language])

  return (
    <ToolShell id="timestamp">
      <div className="flex flex-wrap items-center gap-3">
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="1700000000"
          className="border-line bg-surface placeholder:text-muted focus:border-accent min-w-72 flex-1 rounded-lg border px-3 py-2 font-mono text-sm transition-colors focus:outline-none"
        />
        <Button variant="primary" onClick={() => setInput(unixNow())}>
          {t('tools.timestamp.now')}
        </Button>
      </div>

      <p className="text-muted text-sm">{t('tools.timestamp.hint')}</p>

      <Panel label={t('common.output')}>
        {result.ok && rows ? (
          <div>
            <DataRow label={t('tools.timestamp.relative')} value={rows.relative} />
            <DataRow label={t('tools.timestamp.local')} value={rows.local} />
            <DataRow label="ISO 8601" value={rows.view.iso} />
            <DataRow label="UTC" value={rows.view.utc} />
            <DataRow label={t('tools.timestamp.seconds')} value={String(rows.view.unixSeconds)} />
            <DataRow label={t('tools.timestamp.millis')} value={String(rows.view.unixMillis)} />
          </div>
        ) : (
          <ErrorNote>{result.ok ? '' : t(result.error)}</ErrorNote>
        )}
      </Panel>
    </ToolShell>
  )
}
