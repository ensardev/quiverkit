import {
  compressText,
  decompressText,
  type CompressionFormat,
  type CompressionResult,
} from '@quiverkit/core'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, CodeArea, CopyButton, ErrorNote, Panel, SegmentedControl, ToolShell } from '@/components/ui'

type Mode = 'compress' | 'decompress'

const FORMATS: { value: CompressionFormat; label: string }[] = [
  { value: 'gzip', label: 'GZip' },
  { value: 'deflate', label: 'Deflate' },
  { value: 'deflate-raw', label: 'Raw Deflate' },
]

export default function GzipTool() {
  const { t, i18n } = useTranslation()
  const [mode, setMode] = useState<Mode>('compress')
  const [format, setFormat] = useState<CompressionFormat>('gzip')
  const [input, setInput] = useState('')
  const [output, setOutput] = useState<string | null>(null)
  const [result, setResult] = useState<CompressionResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const number = new Intl.NumberFormat(i18n.language)

  useEffect(() => {
    if (input.trim() === '') {
      setOutput(null)
      setResult(null)
      setError(null)
      return
    }

    let cancelled = false

    if (mode === 'compress') {
      compressText(input, format).then((r) => {
        if (cancelled) return
        if (r.ok) {
          setOutput(r.value.base64)
          setResult(r.value)
          setError(null)
        } else {
          setOutput(null)
          setResult(null)
          setError(r.error)
        }
      })
    } else {
      decompressText(input, format).then((r) => {
        if (cancelled) return
        if (r.ok) {
          setOutput(r.value)
          setResult(null)
          setError(null)
        } else {
          setOutput(null)
          setResult(null)
          setError(r.error)
        }
      })
    }

    return () => {
      cancelled = true
    }
  }, [input, mode, format])

  const pct = result ? ((1 - result.ratio) * 100).toFixed(1) : null

  return (
    <ToolShell id="gzip">
      <div className="flex flex-wrap items-center gap-3">
        <SegmentedControl
          value={mode}
          onChange={setMode}
          options={[
            { value: 'compress', label: t('tools.gzip.compress') },
            { value: 'decompress', label: t('tools.gzip.decompress') },
          ]}
        />
        <SegmentedControl
          value={format}
          onChange={setFormat}
          options={FORMATS}
        />
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
          <CodeArea
            value={input}
            onChange={setInput}
            placeholder={
              mode === 'compress'
                ? 'Type or paste text to compress…'
                : 'Paste base64-encoded compressed data…'
            }
          />
        </Panel>

        <Panel label={t('common.output')} action={<CopyButton value={output ?? ''} />}>
          <CodeArea value={output ?? ''} readOnly />
          {result && (
            <div className="border-line bg-accent-soft text-accent flex flex-wrap items-center gap-4 border-t px-4 py-2 text-xs font-mono">
              <span>
                {number.format(result.originalBytes)} → {number.format(result.compressedBytes)} bytes
              </span>
              {pct && <span>{pct}% smaller</span>}
            </div>
          )}
          {error && <ErrorNote>{t(error)}</ErrorNote>}
        </Panel>
      </div>

      <p className="text-muted text-sm">{t('tools.gzip.note')}</p>
    </ToolShell>
  )
}
