import { HASH_ALGORITHMS, hashBytes, humanBytes, type HashAlgorithm } from '@quiverkit/core'
import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { DataRow, Panel, ToolShell } from '@/components/ui'

type Digests = Partial<Record<HashAlgorithm, string>>

export default function ChecksumTool() {
  const { t, i18n } = useTranslation()
  const [file, setFile] = useState<{ name: string; size: number } | null>(null)
  const [digests, setDigests] = useState<Digests>({})
  const [expected, setExpected] = useState('')
  const [working, setWorking] = useState(false)
  const [dragging, setDragging] = useState(false)
  const picker = useRef<HTMLInputElement>(null)

  async function handle(selected: File) {
    setFile({ name: selected.name, size: selected.size })
    setWorking(true)

    // The file is read into memory here and never leaves it — no upload, which
    // is the whole reason to verify a download in a page like this one.
    const bytes = await selected.arrayBuffer()
    const entries = await Promise.all(
      HASH_ALGORITHMS.map(async (algorithm) => {
        const result = await hashBytes(bytes, algorithm)
        return [algorithm, result.ok ? result.value : ''] as const
      }),
    )

    setDigests(Object.fromEntries(entries))
    setWorking(false)
  }

  const normalised = expected.trim().toLowerCase()
  const match = normalised === '' ? null : Object.values(digests).includes(normalised)
  const size = file ? humanBytes(file.size) : null
  const number = new Intl.NumberFormat(i18n.language, { maximumFractionDigits: 2 })

  return (
    <ToolShell id="checksum">
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
        <p className="font-medium">{t('tools.checksum.drop')}</p>
        <p className="text-muted mt-1 text-sm">{t('tools.checksum.dropHint')}</p>
        <input
          ref={picker}
          type="file"
          className="hidden"
          onChange={(event) => {
            const selected = event.target.files?.[0]
            if (selected) void handle(selected)
          }}
        />
      </div>

      {file && size && (
        <div className="flex flex-wrap items-baseline gap-3">
          <span className="font-medium">{file.name}</span>
          <span className="text-muted text-sm">
            {number.format(size.value)} {size.unit}
          </span>
          {working && <span className="text-muted text-sm">{t('tools.checksum.working')}</span>}
        </div>
      )}

      {Object.keys(digests).length > 0 && (
        <>
          <Panel label={t('tools.checksum.digests')}>
            <div>
              {HASH_ALGORITHMS.map((algorithm) => (
                <DataRow key={algorithm} label={algorithm} value={digests[algorithm] ?? ''} />
              ))}
            </div>
          </Panel>

          <Panel label={t('tools.checksum.compare')}>
            <div className="space-y-3 p-4">
              <input
                value={expected}
                onChange={(event) => setExpected(event.target.value)}
                placeholder={t('tools.checksum.expected')}
                className="border-line bg-sunken focus:border-accent w-full rounded-lg border px-3 py-2 font-mono text-sm transition-colors focus:outline-none"
                spellCheck={false}
              />
              {match !== null && (
                <p
                  className={`rounded-lg px-3 py-2 text-sm ${
                    match ? 'bg-accent-soft text-accent' : 'bg-danger-soft text-danger'
                  }`}
                >
                  {t(match ? 'tools.checksum.match' : 'tools.checksum.noMatch')}
                </p>
              )}
            </div>
          </Panel>
        </>
      )}

      <p className="text-muted text-sm">{t('tools.checksum.note')}</p>
    </ToolShell>
  )
}
