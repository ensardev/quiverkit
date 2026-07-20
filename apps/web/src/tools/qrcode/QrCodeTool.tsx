import { generateQr, readQr } from '@quiverkit/core'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CodeArea, CopyButton, ErrorNote, Panel, SegmentedControl, ToolShell } from '@/components/ui'

type Mode = 'generate' | 'read'

export default function QrCodeTool() {
  const { t } = useTranslation()
  const [mode, setMode] = useState<Mode>('generate')
  const [text, setText] = useState('')
  const [svgResult, setSvgResult] = useState<string | null>(null)
  const [genError, setGenError] = useState<string | null>(null)
  const [file, setFile] = useState<{ name: string; url: string } | null>(null)
  const [decoded, setDecoded] = useState<string | null>(null)
  const [readError, setReadError] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)
  const picker = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (text.trim() === '') {
      setSvgResult(null)
      setGenError(null)
      return
    }

    let cancelled = false
    generateQr(text).then((result) => {
      if (cancelled) return
      if (result.ok) {
        setSvgResult(result.value)
        setGenError(null)
      } else {
        setSvgResult(null)
        setGenError(result.error)
      }
    })

    return () => {
      cancelled = true
    }
  }, [text])

  async function handleFile(selected: File) {
    const url = URL.createObjectURL(selected)
    const img = new Image()
    img.src = url
    await img.decode()

    const canvas = canvasRef.current
    if (!canvas) return

    canvas.width = img.width
    canvas.height = img.height
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.drawImage(img, 0, 0)

    const imageData = ctx.getImageData(0, 0, img.width, img.height)
    const result = await readQr(imageData)

    setFile({ name: selected.name, url })
    if (result.ok) {
      setDecoded(result.value)
      setReadError(null)
    } else {
      setDecoded(null)
      setReadError(result.error)
    }
  }

  return (
    <ToolShell id="qrcode">
      <SegmentedControl
        value={mode}
        onChange={setMode}
        options={[
          { value: 'generate', label: t('tools.qrcode.generate') },
          { value: 'read', label: t('tools.qrcode.read') },
        ]}
      />

      {mode === 'generate' ? (
        <div className="grid flex-1 gap-4 lg:grid-cols-2">
          <Panel
            label={t('common.input')}
            action={
              text !== '' && (
                <button
                  type="button"
                  onClick={() => setText('')}
                  className="text-muted hover:text-ink cursor-pointer text-xs font-medium transition-colors"
                >
                  {t('common.clear')}
                </button>
              )
            }
          >
            <CodeArea
              value={text}
              onChange={setText}
              placeholder="Text or URL to encode..."
            />
          </Panel>

          <Panel label="QR" action={<CopyButton value={svgResult ?? ''} />}>
            {svgResult ? (
              <div
                className="flex items-center justify-center p-4"
                dangerouslySetInnerHTML={{ __html: svgResult }}
              />
            ) : genError ? (
              <ErrorNote>{t(genError)}</ErrorNote>
            ) : (
              <div className="text-muted flex min-h-64 items-center justify-center text-sm">
                {t('common.output')}
              </div>
            )}
          </Panel>
        </div>
      ) : (
        <>
          <div
            onDragOver={(event) => {
              event.preventDefault()
              setDragging(true)
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(event) => {
              event.preventDefault()
              setDragging(false)
              const dropped = event.dataTransfer.files[0]
              if (dropped) void handleFile(dropped)
            }}
            onClick={() => picker.current?.click()}
            className={`cursor-pointer rounded-xl border-2 border-dashed p-10 text-center transition-colors ${
              dragging ? 'border-accent bg-accent-soft' : 'border-line hover:border-line-strong'
            }`}
          >
            <p className="font-medium">{t('tools.qrcode.drop')}</p>
            <p className="text-muted mt-1 text-sm">{t('tools.qrcode.dropHint')}</p>
            <input
              ref={picker}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => {
                const selected = event.target.files?.[0]
                if (selected) void handleFile(selected)
              }}
            />
          </div>

          {readError && <ErrorNote>{t(readError)}</ErrorNote>}

          {file && (
            <div className="grid gap-4 lg:grid-cols-2">
              <Panel label={t('tools.qrcode.uploaded')}>
                <img
                  src={file.url}
                  alt={file.name}
                  className="max-h-64 w-full object-contain p-4"
                />
              </Panel>
              <Panel
                label={t('common.output')}
                action={<CopyButton value={decoded ?? ''} />}
              >
                {decoded ? (
                  <CodeArea value={decoded} readOnly />
                ) : (
                  <div className="text-muted flex min-h-48 items-center justify-center text-sm">
                    {t('tools.qrcode.decoding')}
                  </div>
                )}
              </Panel>
            </div>
          )}

          <canvas ref={canvasRef} className="hidden" />
        </>
      )}
    </ToolShell>
  )
}
