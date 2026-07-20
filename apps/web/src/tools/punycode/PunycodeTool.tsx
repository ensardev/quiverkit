import { fromPunycode, toPunycode } from '@quiverkit/core'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CopyButton, ErrorNote, Panel, SegmentedControl, ToolShell } from '@/components/ui'

type Direction = 'encode' | 'decode'

const EXAMPLES = ['münchen.de', '日本語.jp', 'xn--mnchen-3ya.de']

export default function PunycodeTool() {
  const { t } = useTranslation()
  const [direction, setDirection] = useState<Direction>('encode')
  const [input, setInput] = useState('münchen.de')

  const result = useMemo(
    () => (input.trim() === '' ? null : direction === 'encode' ? toPunycode(input) : fromPunycode(input)),
    [input, direction],
  )

  return (
    <ToolShell id="punycode">
      <SegmentedControl
        value={direction}
        onChange={setDirection}
        options={[
          { value: 'encode', label: t('tools.punycode.encode') },
          { value: 'decode', label: t('tools.punycode.decode') },
        ]}
      />

      <input
        value={input}
        onChange={(event) => setInput(event.target.value)}
        placeholder="münchen.de"
        className="border-line bg-surface focus:border-accent w-full rounded-lg border px-3 py-2 font-mono text-lg transition-colors focus:outline-none"
        spellCheck={false}
      />

      <div className="flex flex-wrap gap-2">
        {EXAMPLES.map((example) => (
          <button
            key={example}
            type="button"
            onClick={() => setInput(example)}
            className="border-line text-muted hover:text-ink hover:bg-hover cursor-pointer rounded-lg border px-3 py-1.5 font-mono text-sm transition-colors"
          >
            {example}
          </button>
        ))}
      </div>

      <Panel
        label={t('common.output')}
        action={<CopyButton value={result?.ok ? result.value : ''} />}
      >
        {result?.ok ? (
          <p className="px-4 py-4 font-mono text-lg break-all">{result.value}</p>
        ) : result ? (
          <ErrorNote>{t(result.error)}</ErrorNote>
        ) : (
          <div className="min-h-16" />
        )}
      </Panel>

      <p className="text-muted text-sm">{t('tools.punycode.note')}</p>
    </ToolShell>
  )
}
