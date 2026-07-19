import { applyCipher, CIPHERS, reverseCipher, type Cipher } from '@quiverkit/core'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CodeArea, CopyButton, Panel, SegmentedControl, ToolShell } from '@/components/ui'

const LABELS: Record<Cipher, string> = {
  rot13: 'ROT13',
  caesar: 'Caesar',
  atbash: 'Atbash',
  reverse: 'Reverse',
  morse: 'Morse',
}

type Direction = 'apply' | 'reverse'

export default function CipherTool() {
  const { t } = useTranslation()
  const [cipher, setCipher] = useState<Cipher>('rot13')
  const [direction, setDirection] = useState<Direction>('apply')
  const [shift, setShift] = useState(3)
  const [input, setInput] = useState('')

  const output = useMemo(
    () =>
      input === ''
        ? ''
        : direction === 'apply'
          ? applyCipher(input, cipher, shift)
          : reverseCipher(input, cipher, shift),
    [input, cipher, direction, shift],
  )

  return (
    <ToolShell id="cipher">
      <div className="flex flex-wrap items-center gap-3">
        <SegmentedControl
          value={cipher}
          onChange={setCipher}
          options={CIPHERS.map((name) => ({ value: name, label: LABELS[name] }))}
        />
        <SegmentedControl
          value={direction}
          onChange={setDirection}
          options={[
            { value: 'apply', label: t('tools.cipher.encode') },
            { value: 'reverse', label: t('tools.cipher.decode') },
          ]}
        />
        {cipher === 'caesar' && (
          <label className="flex items-center gap-2 text-sm">
            <span className="text-muted">{t('tools.cipher.shift')}</span>
            <input
              type="number"
              min={1}
              max={25}
              value={shift}
              onChange={(event) => setShift(Number(event.target.value))}
              className="border-line bg-sunken w-16 rounded-lg border px-2 py-1 text-center font-mono text-sm focus:outline-none"
            />
          </label>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel label={t('common.input')}>
          <CodeArea value={input} onChange={setInput} placeholder={t('common.input')} />
        </Panel>
        <Panel label={t('common.output')} action={<CopyButton value={output} />}>
          <CodeArea value={output} readOnly />
        </Panel>
      </div>

      <p className="text-muted text-sm">{t('tools.cipher.note')}</p>
    </ToolShell>
  )
}
