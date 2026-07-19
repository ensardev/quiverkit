import { gradientToCss, type Gradient, type GradientKind } from '@quiverkit/core'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, CopyButton, Panel, SegmentedControl, ToolShell } from '@/components/ui'

const KINDS: GradientKind[] = ['linear', 'radial', 'conic']

export default function GradientTool() {
  const { t } = useTranslation()
  const [gradient, setGradient] = useState<Gradient>({
    kind: 'linear',
    angle: 135,
    stops: [
      { color: '#b45309', position: 0 },
      { color: '#fbbf24', position: 100 },
    ],
  })

  const css = useMemo(() => gradientToCss(gradient), [gradient])

  const update = (index: number, patch: Partial<Gradient['stops'][number]>) =>
    setGradient((current) => ({
      ...current,
      stops: current.stops.map((stop, position) =>
        position === index ? { ...stop, ...patch } : stop,
      ),
    }))

  return (
    <ToolShell id="gradient">
      <div className="flex flex-wrap items-center gap-3">
        <SegmentedControl
          value={gradient.kind}
          onChange={(kind) => setGradient((current) => ({ ...current, kind }))}
          options={KINDS.map((kind) => ({ value: kind, label: t(`tools.gradient.kind.${kind}`) }))}
        />
        {gradient.kind !== 'radial' && (
          <label className="flex flex-1 items-center gap-3 text-sm">
            <span className="text-muted">{gradient.angle}°</span>
            <input
              type="range"
              min={0}
              max={360}
              value={gradient.angle}
              onChange={(event) =>
                setGradient((current) => ({ ...current, angle: Number(event.target.value) }))
              }
              className="accent-accent min-w-40 flex-1 cursor-pointer"
            />
          </label>
        )}
      </div>

      <div className="border-line h-56 rounded-xl border" style={{ background: css }} />

      <Panel label={t('tools.gradient.stops')}>
        <div className="space-y-3 p-4">
          {gradient.stops.map((stop, index) => (
            <div key={index} className="flex items-center gap-3">
              <input
                type="color"
                value={stop.color}
                onChange={(event) => update(index, { color: event.target.value })}
                className="border-line size-9 cursor-pointer rounded-lg border bg-transparent"
              />
              <input
                value={stop.color}
                onChange={(event) => update(index, { color: event.target.value })}
                className="border-line bg-sunken w-32 rounded-lg border px-2 py-1.5 font-mono text-sm focus:outline-none"
              />
              <input
                type="range"
                min={0}
                max={100}
                value={stop.position}
                onChange={(event) => update(index, { position: Number(event.target.value) })}
                className="accent-accent flex-1 cursor-pointer"
              />
              <span className="text-muted w-12 text-right font-mono text-sm">{stop.position}%</span>
              {gradient.stops.length > 2 && (
                <button
                  type="button"
                  onClick={() =>
                    setGradient((current) => ({
                      ...current,
                      stops: current.stops.filter((_, position) => position !== index),
                    }))
                  }
                  className="text-muted hover:text-danger cursor-pointer text-sm"
                  aria-label={t('common.clear')}
                >
                  ✕
                </button>
              )}
            </div>
          ))}

          <Button
            onClick={() =>
              setGradient((current) => ({
                ...current,
                stops: [...current.stops, { color: '#78716c', position: 50 }],
              }))
            }
          >
            {t('tools.gradient.addStop')}
          </Button>
        </div>
      </Panel>

      <Panel label="CSS" action={<CopyButton value={`background: ${css};`} />}>
        <p className="px-4 py-3 font-mono text-sm break-all">background: {css};</p>
      </Panel>
    </ToolShell>
  )
}
