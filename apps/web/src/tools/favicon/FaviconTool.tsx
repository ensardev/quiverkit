import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, CopyButton, Panel, ToolShell } from '@/components/ui'

/** The set that actually matters in 2026: one modern SVG-sized PNG, one Apple
 *  touch icon, and the two small ones browsers still ask for. */
const SIZES = [16, 32, 180, 192, 512]

const SNIPPET = `<link rel="icon" href="/favicon-32.png" sizes="32x32">
<link rel="icon" href="/favicon-192.png" sizes="192x192">
<link rel="apple-touch-icon" href="/favicon-180.png">`

interface Rendered {
  size: number
  url: string
}

export default function FaviconTool() {
  const { t } = useTranslation()
  const [source, setSource] = useState<string | null>(null)
  const [icons, setIcons] = useState<Rendered[]>([])
  const [dragging, setDragging] = useState(false)
  const picker = useRef<HTMLInputElement>(null)

  async function load(file: File) {
    const url = URL.createObjectURL(file)
    const image = new Image()
    image.src = url
    await image.decode()

    setSource(url)
    setIcons(
      SIZES.map((size) => {
        const canvas = document.createElement('canvas')
        canvas.width = size
        canvas.height = size

        const context = canvas.getContext('2d')
        if (!context) return { size, url: '' }

        // Square icons from a rectangular source look better cropped to the
        // centre than squashed, so we scale by the shorter edge and centre it.
        const scale = Math.max(size / image.width, size / image.height)
        const width = image.width * scale
        const height = image.height * scale

        context.imageSmoothingQuality = 'high'
        context.drawImage(image, (size - width) / 2, (size - height) / 2, width, height)

        return { size, url: canvas.toDataURL('image/png') }
      }),
    )
  }

  function download(icon: Rendered) {
    const link = document.createElement('a')
    link.href = icon.url
    link.download = `favicon-${icon.size}.png`
    link.click()
  }

  return (
    <ToolShell id="favicon">
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
        <p className="font-medium">{t('tools.favicon.drop')}</p>
        <p className="text-muted mt-1 text-sm">{t('tools.favicon.dropHint')}</p>
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

      {source && icons.length > 0 && (
        <>
          <Panel label={t('tools.favicon.sizes')}>
            <div className="flex flex-wrap items-end gap-6 p-6">
              {icons.map((icon) => (
                <div key={icon.size} className="space-y-2 text-center">
                  <img
                    src={icon.url}
                    alt={`${icon.size}`}
                    width={Math.min(icon.size, 96)}
                    height={Math.min(icon.size, 96)}
                    className="border-line mx-auto rounded border"
                  />
                  <div className="text-muted font-mono text-xs">
                    {icon.size}×{icon.size}
                  </div>
                  <Button onClick={() => download(icon)}>{t('tools.favicon.download')}</Button>
                </div>
              ))}
            </div>
          </Panel>

          <Panel label={t('tools.favicon.snippet')} action={<CopyButton value={SNIPPET} />}>
            <pre className="overflow-auto px-4 py-3 font-mono text-sm">{SNIPPET}</pre>
          </Panel>
        </>
      )}

      <p className="text-muted text-sm">{t('tools.favicon.note')}</p>
    </ToolShell>
  )
}
