import { comparePair, simulateAll, VISION_TYPES, type VisionType } from '@quiverkit/core'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CopyButton, ErrorNote, Panel, ToolShell } from '@/components/ui'

/** Below this the two colours are close enough that most people confuse them. */
const CONFUSION_THRESHOLD = 60

export default function VisionTool() {
  const { t } = useTranslation()
  const [first, setFirst] = useState('#e11d48')
  const [second, setSecond] = useState('#16a34a')

  const firstViews = useMemo(() => simulateAll(first), [first])
  const secondViews = useMemo(() => simulateAll(second), [second])
  const distances = useMemo(() => comparePair(first, second), [first, second])

  const field = (value: string, onChange: (next: string) => void) => (
    <div className="flex flex-1 items-center gap-3">
      <input
        type="color"
        value={value.slice(0, 7)}
        onChange={(event) => onChange(event.target.value)}
        className="border-line size-10 shrink-0 cursor-pointer rounded-lg border bg-transparent"
      />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="border-line bg-surface focus:border-accent w-full rounded-lg border px-3 py-2 font-mono text-sm transition-colors focus:outline-none"
      />
    </div>
  )

  const viewFor = (views: typeof firstViews, type: VisionType) =>
    views.ok ? (views.value.find((entry) => entry.type === type)?.hex ?? '#000') : '#000'

  return (
    <ToolShell id="vision">
      <div className="flex flex-col gap-3 sm:flex-row">
        {field(first, setFirst)}
        {field(second, setSecond)}
      </div>

      {firstViews.ok && secondViews.ok && distances.ok ? (
        <Panel label={t('tools.vision.comparison')}>
          <div>
            {VISION_TYPES.map((type) => {
              const gap = distances.value[type]
              const confusing = gap < CONFUSION_THRESHOLD

              return (
                <div
                  key={type}
                  className="border-line flex items-center gap-4 border-b px-4 py-3 last:border-b-0"
                >
                  <span className="w-36 shrink-0 text-sm">{t(`tools.vision.type.${type}`)}</span>

                  <div className="flex flex-1 gap-2">
                    <div
                      className="border-line h-10 flex-1 rounded-lg border"
                      style={{ backgroundColor: viewFor(firstViews, type) }}
                    />
                    <div
                      className="border-line h-10 flex-1 rounded-lg border"
                      style={{ backgroundColor: viewFor(secondViews, type) }}
                    />
                  </div>

                  <span
                    className={`w-28 shrink-0 text-right text-xs font-medium ${
                      confusing ? 'text-danger' : 'text-muted'
                    }`}
                  >
                    {confusing ? t('tools.vision.tooClose') : t('tools.vision.distinct')}
                  </span>
                </div>
              )
            })}
          </div>
        </Panel>
      ) : (
        <ErrorNote>{t('error.invalidColor')}</ErrorNote>
      )}

      {firstViews.ok && (
        <Panel label={t('tools.vision.simulated')}>
          <div className="grid gap-3 p-4 sm:grid-cols-3 lg:grid-cols-5">
            {firstViews.value.map((entry) => (
              <div key={entry.type} className="space-y-2">
                <div
                  className="border-line h-16 rounded-lg border"
                  style={{ backgroundColor: entry.hex }}
                />
                <div className="flex items-center justify-between gap-1">
                  <span className="text-muted truncate text-xs">
                    {t(`tools.vision.type.${entry.type}`)}
                  </span>
                  <CopyButton value={entry.hex} />
                </div>
              </div>
            ))}
          </div>
        </Panel>
      )}

      <p className="text-muted text-sm">{t('tools.vision.note')}</p>
    </ToolShell>
  )
}
