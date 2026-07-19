import { generateLorem, LOREM_LANGUAGES, type LoremLanguage, type LoremUnit } from '@quiverkit/core'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CodeArea, CopyButton, Panel, SegmentedControl, ToolShell } from '@/components/ui'

const LANGUAGE_LABELS: Record<LoremLanguage, string> = {
  latin: 'Lorem',
  en: 'English',
  tr: 'Türkçe',
  es: 'Español',
  ja: '日本語',
}

const UNITS: LoremUnit[] = ['paragraphs', 'sentences', 'words']

export default function LoremTool() {
  const { t } = useTranslation()
  const [language, setLanguage] = useState<LoremLanguage>('latin')
  const [unit, setUnit] = useState<LoremUnit>('paragraphs')
  const [count, setCount] = useState(3)

  const text = useMemo(
    () => generateLorem({ language, unit, count, startWithLorem: true }),
    [language, unit, count],
  )

  return (
    <ToolShell id="lorem">
      <div className="flex flex-wrap items-center gap-3">
        <SegmentedControl
          value={language}
          onChange={setLanguage}
          options={LOREM_LANGUAGES.map((code) => ({ value: code, label: LANGUAGE_LABELS[code] }))}
        />
        <SegmentedControl
          value={unit}
          onChange={setUnit}
          options={UNITS.map((name) => ({ value: name, label: t(`tools.lorem.unit.${name}`) }))}
        />
        <label className="flex items-center gap-2 text-sm">
          <input
            type="number"
            min={1}
            max={200}
            value={count}
            onChange={(event) => setCount(Number(event.target.value))}
            className="border-line bg-sunken w-20 rounded-lg border px-2 py-1 text-center font-mono text-sm focus:outline-none"
          />
        </label>
      </div>

      <Panel label={t('common.output')} action={<CopyButton value={text} />}>
        <CodeArea value={text} readOnly />
      </Panel>

      <p className="text-muted text-sm">{t('tools.lorem.note')}</p>
    </ToolShell>
  )
}
