import { formatXml, minifyXml } from '@quiverkit/core'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CodeArea, CopyButton, ErrorNote, Panel, SegmentedControl, ToolShell } from '@/components/ui'

type Mode = 'format' | 'minify'

export default function XmlTool() {
  const { t } = useTranslation()
  const [mode, setMode] = useState<Mode>('format')
  const [indent, setIndent] = useState(2)
  const [input, setInput] = useState('<library><book id="1"><title>Dune</title></book></library>')

  const result = useMemo(() => {
    if (input.trim() === '') return null
    return mode === 'format' ? formatXml(input, indent) : minifyXml(input)
  }, [input, mode, indent])

  return (
    <ToolShell id="xml">
      <div className="flex flex-wrap items-center gap-3">
        <SegmentedControl
          value={mode}
          onChange={setMode}
          options={[
            { value: 'format', label: t('tools.xml.format') },
            { value: 'minify', label: t('tools.xml.minify') },
          ]}
        />
        {mode === 'format' && (
          <SegmentedControl
            value={String(indent)}
            onChange={(value) => setIndent(Number(value))}
            options={[2, 4].map((size) => ({ value: String(size), label: String(size) }))}
          />
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel label={t('common.input')}>
          <CodeArea value={input} onChange={setInput} placeholder="<root><item/></root>" />
        </Panel>
        <Panel
          label={t('common.output')}
          action={<CopyButton value={result?.ok ? result.value : ''} />}
        >
          <CodeArea value={result?.ok ? result.value : ''} readOnly />
          {result && !result.ok && <ErrorNote>{t(result.error)}</ErrorNote>}
        </Panel>
      </div>

      <p className="text-muted text-sm">{t('tools.xml.note')}</p>
    </ToolShell>
  )
}
