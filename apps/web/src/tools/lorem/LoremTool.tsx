import { generateLorem, type LoremUnit } from '@quiverkit/core'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CodeArea, CopyButton, Panel, SegmentedControl, ToolShell } from '@/components/ui'

const UNITS: LoremUnit[] = ['paragraphs', 'sentences', 'words']

export default function LoremTool() {
  const { t } = useTranslation()
  const [unit, setUnit] = useState<LoremUnit>('paragraphs')
  const [count, setCount] = useState(3)
  const [startWithLorem, setStartWithLorem] = useState(true)

  const text = useMemo(
    () => generateLorem({ unit, count, startWithLorem }),
    [unit, count, startWithLorem],
  )

  return (
    <ToolShell id="lorem">
      <div className="flex flex-wrap items-center gap-3">
        <SegmentedControl
          value={unit}
          onChange={setUnit}
          options={UNITS.map((name) => ({ value: name, label: t(`tools.lorem.unit.${name}`) }))}
        />
        <input
          type="number"
          min={1}
          max={200}
          value={count}
          onChange={(event) => setCount(Number(event.target.value))}
          className="border-line bg-sunken w-20 rounded-lg border px-2 py-1.5 text-center font-mono text-sm focus:outline-none"
        />
        <label className="text-muted flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={startWithLorem}
            onChange={(event) => setStartWithLorem(event.target.checked)}
            className="accent-accent size-4 cursor-pointer"
          />
          {t('tools.lorem.startWithLorem')}
        </label>
      </div>

      <Panel label={t('common.output')} action={<CopyButton value={text} />}>
        <CodeArea value={text} readOnly />
      </Panel>

      <p className="text-muted text-sm">{t('tools.lorem.note')}</p>
    </ToolShell>
  )
}
