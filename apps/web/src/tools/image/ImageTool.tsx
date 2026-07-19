import { humanBytes } from '@quiverkit/core'
import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, Panel, SegmentedControl, ToolShell } from '@/components/ui'

const FORMATS = ['image/webp', 'image/jpeg', 'image/png'] as const

type Format = (typeof FORMATS)[number]

const EXTENSIONS: Record<Format, string> = {
  'image/webp': 'webp',
  'image/jpeg': 'jpg',
  'image/png': 'png',
}

interface Source {
  name: string
  size: number
  width: number
  height: number
  url: string
}

interface Output {
  size: number
  url: string
  blob: Blob
}

export default function ImageTool() {
  const { t, i18n } = useTranslation()
  const [source, setSource] = useState<Source | null>(null)
  const [output, setOutput] = useState<Output | null>(null)
  const [format, setFormat] = useState<Format>('image/webp')
  const [quality, setQuality] = useState(0.85)
  const [maxWidth, setMaxWidth] = useState(0)
  const [dragging, setDragging] = useState(false)
  const picker = useRef<HTMLInputElement>(null)
  const image = useRef<HTMLImageElement | null>(null)

  async function load(file: File) {
    const url = URL.createObjectURL(file)
    const element = new Image()
    element.src = url
    await element.decode()

    image.current = element
    setSource({ name: file.name, size: file.size, width: element.width, height: element.height, url })
    setOutput(null)
  }

  async function convert() {
    const element = image.current
    if (!element) return

    const scale = maxWidth > 0 && element.width > maxWidth ? maxWidth / element.width : 1
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(element.width * scale)
    canvas.height = Math.round(element.height * scale)

    const context = canvas.getContext('2d')
    if (!context) return

    // Re-drawing through a canvas is also what removes every trace of metadata:
    // only pixels survive the round trip.
    context.drawImage(element, 0, 0, canvas.width, canvas.height)

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, format, format === 'image/png' ? undefined : quality),
    )
    if (!blob) return

    setOutput({ size: blob.size, url: URL.createObjectURL(blob), blob })
  }

  function download() {
    if (!output || !source) return

    const link = document.createElement('a')
    link.href = output.url
    link.download = source.name.replace(/\.[^.]+$/, '') + '.' + EXTENSIONS[format]
    link.click()
  }

  const number = new Intl.NumberFormat(i18n.language, { maximumFractionDigits: 2 })
  const show = (bytes: number) => {
    const view = humanBytes(bytes)
    return `${number.format(view.value)} ${view.unit}`
  }

  const saved = source && output ? Math.round((1 - output.size / source.size) * 100) : null

  return (
    <ToolShell id="image">
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
          if (dropped) void load(dropped)
        }}
        onClick={() => picker.current?.click()}
        className={`cursor-pointer rounded-xl border-2 border-dashed p-10 text-center transition-colors ${
          dragging ? 'border-accent bg-accent-soft' : 'border-line hover:border-line-strong'
        }`}
      >
        <p className="font-medium">{t('tools.image.drop')}</p>
        <p className="text-muted mt-1 text-sm">{t('tools.image.dropHint')}</p>
        <input
          ref={picker}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => {
            const selected = event.target.files?.[0]
            if (selected) void load(selected)
          }}
        />
      </div>

      {source && (
        <>
          <div className="flex flex-wrap items-center gap-3">
            <SegmentedControl
              value={format}
              onChange={setFormat}
              options={FORMATS.map((name) => ({ value: name, label: EXTENSIONS[name].toUpperCase() }))}
            />
            {format !== 'image/png' && (
              <label className="flex flex-1 items-center gap-3 text-sm">
                <span className="text-muted">{t('tools.image.quality')}</span>
                <input
                  type="range"
                  min={0.1}
                  max={1}
                  step={0.05}
                  value={quality}
                  onChange={(event) => setQuality(Number(event.target.value))}
                  className="accent-accent min-w-32 flex-1 cursor-pointer"
                />
                <span className="w-10 text-right font-mono">{Math.round(quality * 100)}</span>
              </label>
            )}
            <label className="flex items-center gap-2 text-sm">
              <span className="text-muted">{t('tools.image.maxWidth')}</span>
              <input
                type="number"
                min={0}
                value={maxWidth}
                onChange={(event) => setMaxWidth(Number(event.target.value))}
                className="border-line bg-sunken w-24 rounded-lg border px-2 py-1 text-center font-mono text-sm focus:outline-none"
              />
            </label>
            <Button variant="primary" onClick={() => void convert()}>
              {t('tools.image.convert')}
            </Button>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Panel label={t('tools.image.original')}>
              <div className="space-y-2 p-4">
                <img src={source.url} alt={source.name} className="max-h-64 w-full object-contain" />
                <p className="text-muted text-sm">
                  {source.width}×{source.height} · {show(source.size)}
                </p>
              </div>
            </Panel>

            <Panel label={t('tools.image.result')}>
              {output ? (
                <div className="space-y-2 p-4">
                  <img src={output.url} alt="" className="max-h-64 w-full object-contain" />
                  <p className="text-muted text-sm">
                    {show(output.size)}
                    {saved !== null && (
                      <span className={saved > 0 ? 'text-accent ml-2' : 'text-danger ml-2'}>
                        {saved > 0 ? `−${saved}%` : `+${Math.abs(saved)}%`}
                      </span>
                    )}
                  </p>
                  <Button onClick={download}>{t('tools.image.download')}</Button>
                </div>
              ) : (
                <div className="text-muted flex min-h-48 items-center justify-center p-4 text-sm">
                  {t('tools.image.pending')}
                </div>
              )}
            </Panel>
          </div>
        </>
      )}

      <p className="text-muted text-sm">{t('tools.image.note')}</p>
    </ToolShell>
  )
}
