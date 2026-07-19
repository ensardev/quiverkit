import { convertBase, MAX_BASE, MIN_BASE, toCommonBases } from '@quiverkit/core'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { DataRow, ErrorNote, Panel, SegmentedControl, ToolShell } from '@/components/ui'

const BASE_LABELS: Record<number, string> = { 2: 'BIN', 8: 'OCT', 10: 'DEC', 16: 'HEX' }

export default function NumberBaseTool() {
  const { t } = useTranslation()
  const [input, setInput] = useState('255')
  const [from, setFrom] = useState(10)
  const [custom, setCustom] = useState(36)

  const common = useMemo(() => toCommonBases(input, from), [input, from])
  const customValue = useMemo(() => convertBase(input, from, custom), [input, from, custom])

  return (
    <ToolShell id="numberBase">
      <div className="flex flex-wrap items-center gap-3">
        <SegmentedControl
          value={String(from)}
          onChange={(value) => setFrom(Number(value))}
          options={[2, 8, 10, 16].map((base) => ({
            value: String(base),
            label: BASE_LABELS[base] ?? String(base),
          }))}
        />
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="255"
          className="border-line bg-surface placeholder:text-muted focus:border-accent min-w-64 flex-1 rounded-lg border px-3 py-2 font-mono text-sm transition-colors focus:outline-none"
          spellCheck={false}
        />
      </div>

      <Panel label={t('common.output')}>
        {common.ok ? (
          <div>
            {common.value.map((entry) => (
              <DataRow
                key={entry.base}
                label={BASE_LABELS[entry.base] ?? String(entry.base)}
                hint={t('tools.numberBase.base', { base: entry.base })}
                value={entry.value}
              />
            ))}
          </div>
        ) : (
          <ErrorNote>{t(common.error)}</ErrorNote>
        )}
      </Panel>

      <Panel label={t('tools.numberBase.custom')}>
        <div className="flex items-center gap-3 p-4">
          <input
            type="number"
            min={MIN_BASE}
            max={MAX_BASE}
            value={custom}
            onChange={(event) => setCustom(Number(event.target.value))}
            className="border-line bg-sunken w-20 rounded-lg border px-2 py-1.5 text-center font-mono text-sm focus:outline-none"
          />
          <span className="flex-1 font-mono text-sm break-all">
            {customValue.ok ? customValue.value : '—'}
          </span>
        </div>
      </Panel>

      <p className="text-muted text-sm">{t('tools.numberBase.note')}</p>
    </ToolShell>
  )
}
