import { humanBytes, parseExif, stripExif, type ExifData } from '@quiverkit/core'
import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, DataRow, ErrorNote, Panel, ToolShell } from '@/components/ui'

interface Loaded {
  name: string
  size: number
  buffer: ArrayBuffer
  preview: string
}

export default function ExifTool() {
  const { t, i18n } = useTranslation()
  const [file, setFile] = useState<Loaded | null>(null)
  const [data, setData] = useState<ExifData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)
  const picker = useRef<HTMLInputElement>(null)

  async function handle(selected: File) {
    const buffer = await selected.arrayBuffer()
    const result = parseExif(buffer)

    setFile({
      name: selected.name,
      size: selected.size,
      buffer,
      preview: URL.createObjectURL(selected),
    })

    if (result.ok) {
      setData(result.value)
      setError(null)
    } else {
      setData(null)
      setError(result.error)
    }
  }

  function download() {
    if (!file) return

    const cleaned = stripExif(file.buffer)
    if (!cleaned.ok) return

    const url = URL.createObjectURL(new Blob([cleaned.value], { type: 'image/jpeg' }))
    const link = document.createElement('a')
    link.href = url
    link.download = file.name.replace(/(\.[^.]+)?$/, '-clean$1')
    link.click()
    URL.revokeObjectURL(url)
  }

  const size = file ? humanBytes(file.size) : null
  const number = new Intl.NumberFormat(i18n.language, { maximumFractionDigits: 2 })

  return (
    <ToolShell id="exif">
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
          if (dropped) void handle(dropped)
        }}
        onClick={() => picker.current?.click()}
        className={`cursor-pointer rounded-xl border-2 border-dashed p-10 text-center transition-colors ${
          dragging ? 'border-accent bg-accent-soft' : 'border-line hover:border-line-strong'
        }`}
      >
        <p className="font-medium">{t('tools.exif.drop')}</p>
        <p className="text-muted mt-1 text-sm">{t('tools.exif.dropHint')}</p>
        <input
          ref={picker}
          type="file"
          accept="image/jpeg"
          className="hidden"
          onChange={(event) => {
            const selected = event.target.files?.[0]
            if (selected) void handle(selected)
          }}
        />
      </div>

      {error && <ErrorNote>{t(error)}</ErrorNote>}

      {file && size && (
        <div className="grid gap-4 lg:grid-cols-[200px_1fr]">
          <img
            src={file.preview}
            alt={file.name}
            className="border-line max-h-48 w-full rounded-xl border object-contain"
          />
          <div className="space-y-1">
            <p className="font-medium">{file.name}</p>
            <p className="text-muted text-sm">
              {number.format(size.value)} {size.unit}
            </p>
          </div>
        </div>
      )}

      {data?.gps && (
        <div className="bg-danger-soft text-danger space-y-2 rounded-lg px-4 py-3">
          <p className="font-medium">{t('tools.exif.locationFound')}</p>
          <p className="font-mono text-sm">
            {data.gps.latitude.toFixed(6)}, {data.gps.longitude.toFixed(6)}
          </p>
          <p className="text-sm">{t('tools.exif.locationWarning')}</p>
        </div>
      )}

      {data && data.entries.length === 0 && !data.gps && file && (
        <div className="bg-accent-soft text-accent rounded-lg px-4 py-3 text-sm">
          {t('tools.exif.clean')}
        </div>
      )}

      {data && data.entries.length > 0 && (
        <Panel label={t('tools.exif.metadata')}>
          <div>
            {data.entries.map((entry, index) => (
              <DataRow key={`${entry.name}-${index}`} label={entry.name} value={entry.value} />
            ))}
          </div>
        </Panel>
      )}

      {file && (data?.entries.length || data?.gps) ? (
        <Button variant="primary" onClick={download}>
          {t('tools.exif.download')}
        </Button>
      ) : null}

      <p className="text-muted text-sm">{t('tools.exif.note')}</p>
    </ToolShell>
  )
}
