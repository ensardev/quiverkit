import { base32ToText, base58ToText, textToBase32, textToBase58 } from '@quiverkit/core'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useToolInput } from '@/hooks/useToolInput'
import { CodeArea, CopyButton, ErrorNote, Panel, SegmentedControl, ToolShell } from '@/components/ui'

type Alphabet = 'base32' | 'base58'
type Direction = 'encode' | 'decode'

export default function BaseEncodingTool() {
  const { t } = useTranslation()
  const [alphabet, setAlphabet] = useState<Alphabet>('base32')
  const [direction, setDirection] = useState<Direction>('encode')
  const { value: input, setValue: setInput } = useToolInput()

  const result = useMemo(() => {
    if (input === '') return null

    if (alphabet === 'base32') {
      return direction === 'encode' ? textToBase32(input) : base32ToText(input)
    }
    return direction === 'encode' ? textToBase58(input) : base58ToText(input)
  }, [input, alphabet, direction])

  return (
    <ToolShell id="baseEncoding">
      <div className="flex flex-wrap items-center gap-3">
        <SegmentedControl
          value={alphabet}
          onChange={setAlphabet}
          options={[
            { value: 'base32', label: 'Base32' },
            { value: 'base58', label: 'Base58' },
          ]}
        />
        <SegmentedControl
          value={direction}
          onChange={setDirection}
          options={[
            { value: 'encode', label: t('tools.baseEncoding.encode') },
            { value: 'decode', label: t('tools.baseEncoding.decode') },
          ]}
        />
      </div>

      <p className="text-muted text-sm">{t(`tools.baseEncoding.hint.${alphabet}`)}</p>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel label={t('common.input')}>
          <CodeArea value={input} onChange={setInput} placeholder={t('common.input')} />
        </Panel>
        <Panel
          label={t('common.output')}
          action={<CopyButton value={result?.ok ? result.value : ''} />}
        >
          <CodeArea value={result?.ok ? result.value : ''} readOnly />
          {result && !result.ok && <ErrorNote>{t(result.error)}</ErrorNote>}
        </Panel>
      </div>
    </ToolShell>
  )
}
