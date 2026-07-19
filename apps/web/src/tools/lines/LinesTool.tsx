import { sortLines } from '@quiverkit/core'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  CodeArea,
  CopyButton,
  LocaleSelect,
  Panel,
  SegmentedControl,
  ToolShell,
} from '@/components/ui'

interface ToggleProps {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}

function Toggle({ label, checked, onChange }: ToggleProps) {
  return (
    <label className="text-muted flex cursor-pointer items-center gap-2 text-sm">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="accent-accent size-4 cursor-pointer"
      />
      {label}
    </label>
  )
}

export default function LinesTool() {
  const { t, i18n } = useTranslation()
  const [input, setInput] = useState('')
  const [direction, setDirection] = useState<'asc' | 'desc'>('asc')
  const [unique, setUnique] = useState(false)
  const [caseSensitive, setCaseSensitive] = useState(false)
  const [natural, setNatural] = useState(true)
  const [locale, setLocale] = useState(i18n.language)

  const output = useMemo(() => {
    if (input === '') return ''

    // The alphabet comes from the language of the list, not of the interface:
    // with Turkish selected, ç sorts straight after c instead of past z.
    return sortLines(input, { direction, unique, caseSensitive, natural, locale })
  }, [input, direction, unique, caseSensitive, natural, locale])

  return (
    <ToolShell id="lines">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
        <SegmentedControl
          value={direction}
          onChange={setDirection}
          options={[
            { value: 'asc', label: t('tools.lines.ascending') },
            { value: 'desc', label: t('tools.lines.descending') },
          ]}
        />
        <Toggle label={t('tools.lines.unique')} checked={unique} onChange={setUnique} />
        <Toggle label={t('tools.lines.natural')} checked={natural} onChange={setNatural} />
        <Toggle
          label={t('tools.lines.caseSensitive')}
          checked={caseSensitive}
          onChange={setCaseSensitive}
        />
        <LocaleSelect value={locale} onChange={setLocale} />
      </div>

      <p className="text-muted text-sm">{t('tools.lines.localeNote')}</p>

      <div className="grid flex-1 gap-4 lg:grid-cols-2">
        <Panel
          label={t('common.input')}
          action={
            input !== '' && (
              <button
                type="button"
                onClick={() => setInput('')}
                className="text-muted hover:text-ink cursor-pointer text-xs font-medium transition-colors"
              >
                {t('common.clear')}
              </button>
            )
          }
        >
          <CodeArea value={input} onChange={setInput} placeholder={'item10\nitem2\nitem2'} />
        </Panel>

        <Panel label={t('common.output')} action={<CopyButton value={output} />}>
          <CodeArea value={output} readOnly />
        </Panel>
      </div>
    </ToolShell>
  )
}
