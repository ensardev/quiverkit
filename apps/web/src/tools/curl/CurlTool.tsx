import { CODE_TARGETS, generateCode, parseCurl, type CodeTarget } from '@quiverkit/core'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CodeArea, CopyButton, ErrorNote, Panel, SegmentedControl, ToolShell } from '@/components/ui'

const TARGET_LABELS: Record<CodeTarget, string> = {
  fetch: 'fetch',
  axios: 'axios',
  python: 'Python',
  go: 'Go',
}

export default function CurlTool() {
  const { t } = useTranslation()
  const [target, setTarget] = useState<CodeTarget>('fetch')
  const [input, setInput] = useState(
    `curl -X POST https://api.example.com/users \\\n  -H 'Content-Type: application/json' \\\n  -d '{"name":"Ada"}'`,
  )

  const parsed = useMemo(() => parseCurl(input), [input])
  const code = useMemo(
    () => (parsed.ok ? generateCode(parsed.value, target) : ''),
    [parsed, target],
  )

  return (
    <ToolShell id="curl">
      <SegmentedControl
        value={target}
        onChange={setTarget}
        options={CODE_TARGETS.map((name) => ({ value: name, label: TARGET_LABELS[name] }))}
      />

      <div className="grid flex-1 gap-4 lg:grid-cols-2">
        <Panel
          label={t('tools.curl.command')}
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
          <CodeArea value={input} onChange={setInput} placeholder="curl https://api.example.com" />
          {!parsed.ok && <ErrorNote>{t(parsed.error)}</ErrorNote>}
        </Panel>

        <Panel label={TARGET_LABELS[target]} action={<CopyButton value={code} />}>
          <CodeArea value={code} readOnly />
        </Panel>
      </div>

      {parsed.ok && (
        <Panel label={t('tools.curl.request')}>
          <div className="space-y-1 p-4 font-mono text-sm">
            <div>
              <span className="text-accent">{parsed.value.method}</span> {parsed.value.url}
            </div>
            {parsed.value.headers.map((header) => (
              <div key={header.key} className="text-muted">
                {header.key}: {header.value}
              </div>
            ))}
          </div>
        </Panel>
      )}

      <p className="text-muted text-sm">{t('tools.curl.note')}</p>
    </ToolShell>
  )
}
