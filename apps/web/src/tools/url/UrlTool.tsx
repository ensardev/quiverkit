import {
  decodeUrl,
  decodeUrlComponent,
  encodeUrl,
  encodeUrlComponent,
  parseUrl,
  type Result,
} from '@quiverkit/core'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useToolInput } from '@/hooks/useToolInput'
import {
  CodeArea,
  CopyButton,
  DataRow,
  ErrorNote,
  Panel,
  SegmentedControl,
  ToolShell,
} from '@/components/ui'

type Mode = 'encode' | 'decode' | 'parse'

export default function UrlTool() {
  const { t } = useTranslation()
  const [mode, setMode] = useState<Mode>('encode')
  const [whole, setWhole] = useState(false)
  const { value: input, setValue: setInput } = useToolInput()

  const text: Result<string> | null = useMemo(() => {
    if (input === '' || mode === 'parse') return null

    if (mode === 'encode') return whole ? encodeUrl(input) : encodeUrlComponent(input)
    return whole ? decodeUrl(input) : decodeUrlComponent(input)
  }, [input, mode, whole])

  const parsed = useMemo(
    () => (mode === 'parse' && input !== '' ? parseUrl(input) : null),
    [input, mode],
  )

  const output = text?.ok ? text.value : ''
  const error = text?.ok === false ? text.error : parsed?.ok === false ? parsed.error : null

  return (
    <ToolShell id="url">
      <div className="flex flex-wrap items-center gap-3">
        <SegmentedControl
          value={mode}
          onChange={setMode}
          options={[
            { value: 'encode', label: t('tools.url.encode') },
            { value: 'decode', label: t('tools.url.decode') },
            { value: 'parse', label: t('tools.url.parse') },
          ]}
        />
        {mode !== 'parse' && (
          <label className="text-muted flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={whole}
              onChange={(event) => setWhole(event.target.checked)}
              className="accent-accent size-4 cursor-pointer"
            />
            {t('tools.url.wholeUrl')}
          </label>
        )}
      </div>

      <p className="text-muted text-sm">
        {t(mode === 'parse' ? 'tools.url.parseHint' : whole ? 'tools.url.wholeHint' : 'tools.url.componentHint')}
      </p>

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
            placeholder="https://quiverkit.dev/jwt?lang=tr"
          />
          {error && <ErrorNote>{t(error)}</ErrorNote>}
        </Panel>

        {mode === 'parse' ? (
          <Panel label={t('common.output')}>
            {parsed?.ok ? (
              <div>
                <DataRow label={t('tools.url.protocol')} value={parsed.value.protocol} />
                <DataRow label={t('tools.url.host')} value={parsed.value.host} />
                {parsed.value.port && <DataRow label={t('tools.url.port')} value={parsed.value.port} />}
                <DataRow label={t('tools.url.path')} value={parsed.value.path} />
                {parsed.value.hash && <DataRow label={t('tools.url.hash')} value={parsed.value.hash} />}
                {parsed.value.params.map((param) => (
                  <DataRow key={param.key} label={param.key} hint={t('tools.url.param')} value={param.value} />
                ))}
              </div>
            ) : (
              <div className="min-h-64" />
            )}
          </Panel>
        ) : (
          <Panel label={t('common.output')} action={<CopyButton value={output} />}>
            <CodeArea value={output} readOnly />
          </Panel>
        )}
      </div>
    </ToolShell>
  )
}
