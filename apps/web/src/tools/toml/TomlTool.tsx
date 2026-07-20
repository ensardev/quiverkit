import type { Result } from '@quiverkit/core'
import { jsonToToml, tomlToJson } from '@quiverkit/core/toml'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CodeArea, CopyButton, ErrorNote, Panel, SegmentedControl, ToolShell } from '@/components/ui'

type Direction = 'tomlToJson' | 'jsonToToml'

const INDENTS = [2, 4] as const

export default function TomlTool() {
  const { t } = useTranslation()
  const [direction, setDirection] = useState<Direction>('tomlToJson')
  const [indent, setIndent] = useState<number>(2)
  const [input, setInput] = useState('')

  const result: Result<string> | null = useMemo(() => {
    if (input === '') return null
    return direction === 'tomlToJson' ? tomlToJson(input, indent) : jsonToToml(input)
  }, [input, direction, indent])

  const output = result?.ok ? result.value : ''

  return (
    <ToolShell id="toml">
      <div className="flex flex-wrap items-center gap-3">
        <SegmentedControl
          value={direction}
          onChange={setDirection}
          options={[
            { value: 'tomlToJson', label: t('tools.toml.toJson') },
            { value: 'jsonToToml', label: t('tools.toml.toToml') },
          ]}
        />
        {direction === 'tomlToJson' && (
          <SegmentedControl
            value={String(indent)}
            onChange={(value) => setIndent(Number(value))}
            options={INDENTS.map((size) => ({ value: String(size), label: `${size}` }))}
          />
        )}
      </div>

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
          <CodeArea
            value={input}
            onChange={setInput}
            placeholder={
              direction === 'tomlToJson'
                ? 'name = "QuiverKit"\nversion = 1'
                : '{ "name": "QuiverKit", "version": 1 }'
            }
          />
        </Panel>

        <Panel label={t('common.output')} action={<CopyButton value={output} />}>
          <CodeArea value={output} readOnly />
          {result && !result.ok && <ErrorNote>{t(result.error)}</ErrorNote>}
        </Panel>
      </div>
    </ToolShell>
  )
}
