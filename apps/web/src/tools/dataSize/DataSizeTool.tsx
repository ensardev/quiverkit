import { BINARY_UNITS, DECIMAL_UNITS, fromBytes, toBytes, type SizeUnit } from '@quiverkit/core'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { DataRow, Panel, ToolShell } from '@/components/ui'

const ALL_UNITS: SizeUnit[] = [...DECIMAL_UNITS, ...BINARY_UNITS.slice(1)]

export default function DataSizeTool() {
  const { t, i18n } = useTranslation()
  const [amount, setAmount] = useState('1')
  const [unit, setUnit] = useState<SizeUnit>('GB')

  const number = useMemo(
    () => new Intl.NumberFormat(i18n.language, { maximumFractionDigits: 6 }),
    [i18n.language],
  )

  const views = useMemo(() => {
    const parsed = Number(amount.replace(',', '.'))
    const bytes = toBytes(Number.isFinite(parsed) ? parsed : 0, unit)
    return bytes.ok ? { bytes: bytes.value, ...fromBytes(bytes.value) } : null
  }, [amount, unit])

  return (
    <ToolShell id="dataSize">
      <div className="flex flex-wrap items-center gap-3">
        <input
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          placeholder="1"
          className="border-line bg-surface placeholder:text-muted focus:border-accent min-w-48 flex-1 rounded-lg border px-3 py-2 font-mono text-sm transition-colors focus:outline-none"
        />
        <select
          value={unit}
          onChange={(event) => setUnit(event.target.value as SizeUnit)}
          className="border-line bg-surface text-ink cursor-pointer rounded-lg border px-3 py-2 font-mono text-sm focus:outline-none"
        >
          {ALL_UNITS.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </div>

      {views && (
        <>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-2xl font-semibold">{number.format(views.bytes)}</span>
            <span className="text-muted text-sm">{t('tools.dataSize.bytes')}</span>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Panel label={t('tools.dataSize.decimal')}>
              <div>
                {views.decimal.map((entry) => (
                  <DataRow key={entry.unit} label={entry.unit} value={number.format(entry.value)} />
                ))}
              </div>
            </Panel>
            <Panel label={t('tools.dataSize.binary')}>
              <div>
                {views.binary.map((entry) => (
                  <DataRow key={entry.unit} label={entry.unit} value={number.format(entry.value)} />
                ))}
              </div>
            </Panel>
          </div>
        </>
      )}

      <p className="text-muted text-sm">{t('tools.dataSize.note')}</p>
    </ToolShell>
  )
}
