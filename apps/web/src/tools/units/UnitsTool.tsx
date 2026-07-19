import { convertUnits, CSS_UNITS, type CssUnit } from '@quiverkit/core'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { DataRow, ErrorNote, Panel, SegmentedControl, ToolShell } from '@/components/ui'

const UNIT_LABELS: Record<CssUnit, string> = {
  px: 'px',
  rem: 'rem',
  em: 'em',
  pt: 'pt',
  percent: '%',
}

export default function UnitsTool() {
  const { t } = useTranslation()
  const [value, setValue] = useState('24')
  const [from, setFrom] = useState<CssUnit>('px')
  const [rootFontSize, setRootFontSize] = useState(16)
  const [parentFontSize, setParentFontSize] = useState(16)

  const result = useMemo(
    () => convertUnits(Number(value.replace(',', '.')), from, { rootFontSize, parentFontSize }),
    [value, from, rootFontSize, parentFontSize],
  )

  return (
    <ToolShell id="units">
      <div className="flex flex-wrap items-center gap-3">
        <input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          className="border-line bg-surface focus:border-accent min-w-40 flex-1 rounded-lg border px-3 py-2 font-mono text-lg transition-colors focus:outline-none"
        />
        <SegmentedControl
          value={from}
          onChange={setFrom}
          options={CSS_UNITS.map((unit) => ({ value: unit, label: UNIT_LABELS[unit] }))}
        />
      </div>

      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2 text-sm">
          <span className="text-muted">{t('tools.units.rootFontSize')}</span>
          <input
            type="number"
            min={1}
            value={rootFontSize}
            onChange={(event) => setRootFontSize(Number(event.target.value))}
            className="border-line bg-sunken w-20 rounded-lg border px-2 py-1 text-center font-mono text-sm focus:outline-none"
          />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <span className="text-muted">{t('tools.units.parentFontSize')}</span>
          <input
            type="number"
            min={1}
            value={parentFontSize}
            onChange={(event) => setParentFontSize(Number(event.target.value))}
            className="border-line bg-sunken w-20 rounded-lg border px-2 py-1 text-center font-mono text-sm focus:outline-none"
          />
        </label>
      </div>

      <Panel label={t('common.output')}>
        {result.ok ? (
          <div>
            {result.value.map((entry) => (
              <DataRow
                key={entry.unit}
                label={UNIT_LABELS[entry.unit]}
                value={`${entry.value}${entry.unit === 'percent' ? '%' : entry.unit}`}
              />
            ))}
          </div>
        ) : (
          <ErrorNote>{t(result.error)}</ErrorNote>
        )}
      </Panel>

      <p className="text-muted text-sm">{t('tools.units.note')}</p>
    </ToolShell>
  )
}
