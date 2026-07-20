import { formatGraphql, minifyGraphql, type Result } from '@quiverkit/core'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CodeArea, CopyButton, ErrorNote, Panel, SegmentedControl, ToolShell } from '@/components/ui'

type Mode = 'format' | 'minify'

const INDENTS = [2, 4] as const

export default function GraphqlTool() {
  const { t } = useTranslation()
  const [mode, setMode] = useState<Mode>('format')
  const [indent, setIndent] = useState<number>(2)
  const [input, setInput] = useState('')

  const result: Result<string> | null = useMemo(() => {
    if (input === '') return null
    return mode === 'format' ? formatGraphql(input, indent) : minifyGraphql(input)
  }, [input, mode, indent])

  const output = result?.ok ? result.value : ''

  return (
    <ToolShell id="graphql">
      <div className="flex flex-wrap items-center gap-3">
        <SegmentedControl
          value={mode}
          onChange={setMode}
          options={[
            { value: 'format', label: t('common.output') },
            { value: 'minify', label: t('tools.graphql.minify') },
          ]}
        />
        {mode === 'format' && (
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
          action={input !== '' && (
            <button type="button" onClick={() => setInput('')} className="text-muted hover:text-ink cursor-pointer text-xs font-medium transition-colors">
              {t('common.clear')}
            </button>
          )}
        >
          <CodeArea
            value={input}
            onChange={setInput}
            placeholder="{ user(id: 1) { name email } }"
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
