import { formatDumpRow, hexDump, hexToText, textToHex } from '@quiverkit/core'
import { useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CodeArea, CopyButton, ErrorNote, Panel, SegmentedControl, ToolShell } from '@/components/ui'

type Mode = 'encode' | 'decode' | 'dump'

export default function HexTool() {
  const { t } = useTranslation()
  const [mode, setMode] = useState<Mode>('encode')
  const [input, setInput] = useState('')
  const [dump, setDump] = useState<string>('')
  const [fileName, setFileName] = useState('')
  const picker = useRef<HTMLInputElement>(null)

  const result = useMemo(() => {
    if (mode === 'dump' || input === '') return null
    return mode === 'encode' ? textToHex(input) : hexToText(input)
  }, [input, mode])

  async function load(file: File) {
    const buffer = await file.arrayBuffer()
    setFileName(file.name)
    setDump(hexDump(buffer).slice(0, 512).map(formatDumpRow).join('\n'))
  }

  return (
    <ToolShell id="hex">
      <SegmentedControl
        value={mode}
        onChange={setMode}
        options={[
          { value: 'encode', label: t('tools.hex.encode') },
          { value: 'decode', label: t('tools.hex.decode') },
          { value: 'dump', label: t('tools.hex.dump') },
        ]}
      />

      {mode === 'dump' ? (
        <>
          <div
            onClick={() => picker.current?.click()}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault()
              const dropped = event.dataTransfer.files[0]
              if (dropped) void load(dropped)
            }}
            className="border-line hover:border-line-strong cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-colors"
          >
            <p className="font-medium">{t('tools.hex.drop')}</p>
            <p className="text-muted mt-1 text-sm">{fileName || t('tools.hex.dropHint')}</p>
            <input
              ref={picker}
              type="file"
              className="hidden"
              onChange={(event) => {
                const selected = event.target.files?.[0]
                if (selected) void load(selected)
              }}
            />
          </div>

          {dump !== '' && (
            <Panel label={t('tools.hex.dump')} action={<CopyButton value={dump} />}>
              <pre className="max-h-[32rem] overflow-auto px-4 py-3 font-mono text-xs leading-relaxed">
                {dump}
              </pre>
            </Panel>
          )}
        </>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <Panel label={t('common.input')}>
            <CodeArea
              value={input}
              onChange={setInput}
              placeholder={mode === 'encode' ? 'Hello' : '48 65 6c 6c 6f'}
            />
          </Panel>
          <Panel
            label={t('common.output')}
            action={<CopyButton value={result?.ok ? result.value : ''} />}
          >
            <CodeArea value={result?.ok ? result.value : ''} readOnly />
            {result && !result.ok && <ErrorNote>{t(result.error)}</ErrorNote>}
          </Panel>
        </div>
      )}

      <p className="text-muted text-sm">{t('tools.hex.note')}</p>
    </ToolShell>
  )
}
