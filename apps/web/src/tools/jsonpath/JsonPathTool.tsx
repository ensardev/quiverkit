import { queryJson } from '@quiverkit/core'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, CodeArea, CopyButton, ErrorNote, Panel, ToolShell } from '@/components/ui'

const SAMPLE = JSON.stringify(
  {
    store: {
      books: [
        { title: 'Dune', price: 12 },
        { title: 'Solaris', price: 9 },
      ],
      owner: { name: 'Ada' },
    },
  },
  null,
  2,
)

const EXAMPLES = ['$.store.books[*].title', '$.store.books[0]', '$..name', '$.store.books[0:2]']

export default function JsonPathTool() {
  const { t } = useTranslation()
  const [json, setJson] = useState(SAMPLE)
  const [path, setPath] = useState('$.store.books[*].title')

  const result = useMemo(() => queryJson(json, path), [json, path])

  const output = useMemo(
    () => (result.ok ? JSON.stringify(result.value.map((match) => match.value), null, 2) : ''),
    [result],
  )

  return (
    <ToolShell id="jsonpath">
      <input
        value={path}
        onChange={(event) => setPath(event.target.value)}
        placeholder="$.store.books[*].title"
        className="border-line bg-surface focus:border-accent w-full rounded-lg border px-3 py-2 font-mono text-sm transition-colors focus:outline-none"
        spellCheck={false}
      />

      <div className="flex flex-wrap gap-2">
        {EXAMPLES.map((example) => (
          <Button key={example} onClick={() => setPath(example)}>
            <span className="font-mono text-xs">{example}</span>
          </Button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel label="JSON">
          <CodeArea value={json} onChange={setJson} placeholder="{ }" />
        </Panel>
        <Panel
          label={t('tools.jsonpath.matches', { count: result.ok ? result.value.length : 0 })}
          action={<CopyButton value={output} />}
        >
          <CodeArea value={output} readOnly />
          {!result.ok && <ErrorNote>{t(result.error)}</ErrorNote>}
        </Panel>
      </div>

      {result.ok && result.value.length > 0 && (
        <Panel label={t('tools.jsonpath.paths')}>
          <div className="max-h-64 overflow-auto">
            {result.value.map((match, index) => (
              <div key={index} className="border-line border-b px-4 py-1.5 last:border-b-0">
                <span className="text-muted font-mono text-xs">{match.path}</span>
              </div>
            ))}
          </div>
        </Panel>
      )}

      <p className="text-muted text-sm">{t('tools.jsonpath.note')}</p>
    </ToolShell>
  )
}
