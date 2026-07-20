import { stripHtml, type Result } from '@quiverkit/core'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CodeArea, CopyButton, ErrorNote, Panel, ToolShell } from '@/components/ui'

export default function HtmlTool() {
  const { t } = useTranslation()
  const [input, setInput] = useState('')

  const result: Result<string> | null = useMemo(() => {
    if (input === '') return null
    return stripHtml(input)
  }, [input])

  const output = result?.ok ? result.value : ''

  return (
    <ToolShell id="html">
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
            placeholder="<p>Paste HTML here…</p>"
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
