import { jsonToSchema, jsonToTypeScript } from '@quiverkit/core'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CodeArea, CopyButton, ErrorNote, Panel, SegmentedControl, ToolShell } from '@/components/ui'

type Target = 'typescript' | 'schema'

export default function JsonTypesTool() {
  const { t } = useTranslation()
  const [target, setTarget] = useState<Target>('typescript')
  const [rootName, setRootName] = useState('Root')
  const [input, setInput] = useState('{\n  "id": 1,\n  "name": "Ada",\n  "tags": ["a", "b"]\n}')

  const result = useMemo(() => {
    if (input.trim() === '') return null
    return target === 'typescript' ? jsonToTypeScript(input, rootName) : jsonToSchema(input)
  }, [input, target, rootName])

  return (
    <ToolShell id="jsonTypes">
      <div className="flex flex-wrap items-center gap-3">
        <SegmentedControl
          value={target}
          onChange={setTarget}
          options={[
            { value: 'typescript', label: 'TypeScript' },
            { value: 'schema', label: 'JSON Schema' },
          ]}
        />
        {target === 'typescript' && (
          <label className="flex items-center gap-2 text-sm">
            <span className="text-muted">{t('tools.jsonTypes.rootName')}</span>
            <input
              value={rootName}
              onChange={(event) => setRootName(event.target.value)}
              className="border-line bg-sunken w-36 rounded-lg border px-2 py-1 font-mono text-sm focus:outline-none"
            />
          </label>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel label="JSON">
          <CodeArea value={input} onChange={setInput} placeholder='{ "id": 1 }' />
        </Panel>
        <Panel
          label={t('common.output')}
          action={<CopyButton value={result?.ok ? result.value : ''} />}
        >
          <CodeArea value={result?.ok ? result.value : ''} readOnly />
          {result && !result.ok && <ErrorNote>{t(result.error)}</ErrorNote>}
        </Panel>
      </div>

      <p className="text-muted text-sm">{t('tools.jsonTypes.note')}</p>
    </ToolShell>
  )
}
