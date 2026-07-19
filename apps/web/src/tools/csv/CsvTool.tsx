import { csvToJson, jsonToCsv } from '@quiverkit/core'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CodeArea, CopyButton, ErrorNote, Panel, SegmentedControl, ToolShell } from '@/components/ui'

type Direction = 'toJson' | 'toCsv'

const DELIMITERS = [
  { value: ',', label: ',' },
  { value: ';', label: ';' },
  { value: '\t', label: 'Tab' },
  { value: '|', label: '|' },
]

export default function CsvTool() {
  const { t } = useTranslation()
  const [direction, setDirection] = useState<Direction>('toJson')
  const [delimiter, setDelimiter] = useState(',')
  const [hasHeader, setHasHeader] = useState(true)
  const [input, setInput] = useState('name,age,active\nAda,36,true\nKenji,29,false')

  const result = useMemo(() => {
    if (input.trim() === '') return null
    const options = { delimiter, hasHeader }
    return direction === 'toJson' ? csvToJson(input, options) : jsonToCsv(input, options)
  }, [input, direction, delimiter, hasHeader])

  return (
    <ToolShell id="csv">
      <div className="flex flex-wrap items-center gap-3">
        <SegmentedControl
          value={direction}
          onChange={setDirection}
          options={[
            { value: 'toJson', label: 'CSV → JSON' },
            { value: 'toCsv', label: 'JSON → CSV' },
          ]}
        />
        <SegmentedControl value={delimiter} onChange={setDelimiter} options={DELIMITERS} />
        {direction === 'toJson' && (
          <label className="text-muted flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={hasHeader}
              onChange={(event) => setHasHeader(event.target.checked)}
              className="accent-accent size-4 cursor-pointer"
            />
            {t('tools.csv.hasHeader')}
          </label>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel label={t('common.input')}>
          <CodeArea value={input} onChange={setInput} placeholder={t('common.input')} />
        </Panel>
        <Panel
          label={t('common.output')}
          action={<CopyButton value={result?.ok ? result.value : ''} />}
        >
          <CodeArea value={result?.ok ? result.value : ''} readOnly />
          {result && !result.ok && <ErrorNote>{t(result.error)}</ErrorNote>}
        </Panel>
      </div>

      <p className="text-muted text-sm">{t('tools.csv.note')}</p>
    </ToolShell>
  )
}
