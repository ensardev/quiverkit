import { buildPalette, harmony, type HarmonyKind } from '@quiverkit/core'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CopyButton, ErrorNote, Panel, SegmentedControl, ToolShell } from '@/components/ui'

const HARMONIES: HarmonyKind[] = ['complementary', 'analogous', 'triadic', 'tetradic']

export default function PaletteTool() {
  const { t } = useTranslation()
  const [base, setBase] = useState('#3b82f6')
  const [kind, setKind] = useState<HarmonyKind>('analogous')

  const palette = useMemo(() => buildPalette(base), [base])
  const scheme = useMemo(() => harmony(base, kind), [base, kind])

  const asCss = useMemo(
    () =>
      palette.ok
        ? palette.value.map((entry) => `  --colour-${entry.step}: ${entry.hex};`).join('\n')
        : '',
    [palette],
  )

  return (
    <ToolShell id="palette">
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="color"
          value={base.slice(0, 7)}
          onChange={(event) => setBase(event.target.value)}
          className="border-line size-10 cursor-pointer rounded-lg border bg-transparent"
        />
        <input
          value={base}
          onChange={(event) => setBase(event.target.value)}
          className="border-line bg-surface focus:border-accent w-40 rounded-lg border px-3 py-2 font-mono text-sm transition-colors focus:outline-none"
        />
      </div>

      {palette.ok ? (
        <>
          <div className="border-line overflow-hidden rounded-xl border">
            <div className="flex h-24">
              {palette.value.map((entry) => (
                <div
                  key={entry.step}
                  className="flex flex-1 items-end justify-center pb-1"
                  style={{ backgroundColor: entry.hex }}
                >
                  <span
                    className="text-xs font-medium"
                    style={{ color: entry.onWhite > entry.onBlack ? '#ffffff' : '#000000' }}
                  >
                    {entry.step}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <Panel label={t('tools.palette.steps')}>
            <div className="max-h-96 overflow-auto">
              {palette.value.map((entry) => (
                <div
                  key={entry.step}
                  className="border-line flex items-center gap-4 border-b px-4 py-2 last:border-b-0"
                >
                  <span className="border-line size-8 shrink-0 rounded-lg border" style={{ backgroundColor: entry.hex }} />
                  <span className="w-12 shrink-0 font-mono text-sm">{entry.step}</span>
                  <span className="flex-1 font-mono text-sm">{entry.hex}</span>
                  <span className="text-muted shrink-0 text-xs">
                    {t('tools.palette.onWhite')} {entry.onWhite} · {t('tools.palette.onBlack')}{' '}
                    {entry.onBlack}
                  </span>
                  <CopyButton value={entry.hex} />
                </div>
              ))}
            </div>
          </Panel>

          <Panel label={t('tools.palette.css')} action={<CopyButton value={`:root {\n${asCss}\n}`} />}>
            <pre className="overflow-auto px-4 py-3 font-mono text-sm">{`:root {\n${asCss}\n}`}</pre>
          </Panel>
        </>
      ) : (
        <ErrorNote>{t(palette.error)}</ErrorNote>
      )}

      <SegmentedControl
        value={kind}
        onChange={setKind}
        options={HARMONIES.map((name) => ({ value: name, label: t(`tools.palette.harmony.${name}`) }))}
      />

      {scheme.ok && (
        <div className="flex gap-3">
          {scheme.value.map((colour) => (
            <div key={colour} className="flex-1 space-y-2">
              <div className="border-line h-20 rounded-xl border" style={{ backgroundColor: colour }} />
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm">{colour}</span>
                <CopyButton value={colour} />
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-muted text-sm">{t('tools.palette.note')}</p>
    </ToolShell>
  )
}
