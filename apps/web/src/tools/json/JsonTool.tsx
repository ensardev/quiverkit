import { formatJson, minifyJson, sortJsonKeys, type Result } from '@quiverkit/core'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useToolInput } from '@/hooks/useToolInput'
import {
  CodeArea,
  CopyButton,
  ErrorNote,
  Panel,
  SegmentedControl,
  ShareButton,
  ToolShell,
} from '@/components/ui'

type Mode = 'format' | 'minify' | 'sort'

const INDENTS = [2, 4] as const

export default function JsonTool() {
  const { t } = useTranslation()
  const [mode, setMode] = useState<Mode>('format')
  const [indent, setIndent] = useState<number>(2)
  const { value: input, setValue: setInput, share } = useToolInput()

  const result: Result<string> | null = useMemo(() => {
    if (input === '') return null

    switch (mode) {
      case 'format':
        return formatJson(input, indent)
      case 'minify':
        return minifyJson(input)
      case 'sort':
        return sortJsonKeys(input, indent)
    }
  }, [input, mode, indent])

  const output = result?.ok ? result.value : ''

  return (
    <ToolShell id="json">
      <div className="flex flex-wrap items-center gap-3">
        <SegmentedControl
          value={mode}
          onChange={setMode}
          options={[
            { value: 'format', label: t('tools.json.format') },
            { value: 'minify', label: t('tools.json.minify') },
            { value: 'sort', label: t('tools.json.sort') },
          ]}
        />
        {mode !== 'minify' && (
          <SegmentedControl
            value={String(indent)}
            onChange={(value) => setIndent(Number(value))}
            options={INDENTS.map((size) => ({ value: String(size), label: `${size}` }))}
          />
        )}
        <div className="ml-auto">
          <ShareButton share={share} disabled={input === ''} />
        </div>
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
          <CodeArea value={input} onChange={setInput} placeholder='{ "hello": "world" }' />
        </Panel>

        <Panel label={t('common.output')} action={<CopyButton value={output} />}>
          <CodeArea value={output} readOnly />
          {result && !result.ok && <ErrorNote>{t(result.error)}</ErrorNote>}
        </Panel>
      </div>
    </ToolShell>
  )
}
