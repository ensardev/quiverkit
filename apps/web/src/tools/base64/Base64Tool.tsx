import {
  decodeBase64,
  decodeBase64Url,
  encodeBase64,
  encodeBase64Url,
  type Result,
} from '@quiverkit/core'
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

type Mode = 'encode' | 'decode'

export default function Base64Tool() {
  const { t } = useTranslation()
  const [mode, setMode] = useState<Mode>('encode')
  const [urlSafe, setUrlSafe] = useState(false)
  const { value: input, setValue: setInput, share } = useToolInput()

  const result: Result<string> | null = useMemo(() => {
    if (input === '') return null

    if (mode === 'encode') return urlSafe ? encodeBase64Url(input) : encodeBase64(input)
    return urlSafe ? decodeBase64Url(input) : decodeBase64(input)
  }, [input, mode, urlSafe])

  const output = result?.ok ? result.value : ''

  return (
    <ToolShell id="base64">
      <div className="flex flex-wrap items-center gap-3">
        <SegmentedControl
          value={mode}
          onChange={setMode}
          options={[
            { value: 'encode', label: t('tools.base64.encode') },
            { value: 'decode', label: t('tools.base64.decode') },
          ]}
        />
        <label className="text-muted flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={urlSafe}
            onChange={(event) => setUrlSafe(event.target.checked)}
            className="accent-accent size-4 cursor-pointer"
          />
          {t('tools.base64.urlSafe')}
        </label>
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
          <CodeArea value={input} onChange={setInput} placeholder={t('common.input')} />
        </Panel>

        <Panel label={t('common.output')} action={<CopyButton value={output} />}>
          <CodeArea value={output} readOnly />
          {result && !result.ok && <ErrorNote>{t(result.error)}</ErrorNote>}
        </Panel>
      </div>
    </ToolShell>
  )
}
