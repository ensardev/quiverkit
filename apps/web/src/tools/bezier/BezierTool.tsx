import { BEZIER_PRESETS, sample, toCss, type BezierCurve } from '@quiverkit/core'
import { useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, CopyButton, Panel, ToolShell } from '@/components/ui'

const SIZE = 320
/** Room above and below the box so an overshooting curve stays visible. */
const PADDING = 60

export default function BezierTool() {
  const { t } = useTranslation()
  const [curve, setCurve] = useState<BezierCurve>(BEZIER_PRESETS.ease as BezierCurve)
  const [playing, setPlaying] = useState(0)
  const surface = useRef<SVGSVGElement>(null)

  const points = useMemo(() => sample(curve, 80), [curve])

  const toScreen = (x: number, y: number) => ({
    x: x * SIZE,
    y: PADDING + (1 - y) * SIZE,
  })

  const path = points
    .map((point, index) => {
      const screen = toScreen(point.x, point.y)
      return `${index === 0 ? 'M' : 'L'}${screen.x.toFixed(2)},${screen.y.toFixed(2)}`
    })
    .join(' ')

  function drag(handle: 1 | 2) {
    return (event: React.PointerEvent<SVGCircleElement>) => {
      event.currentTarget.setPointerCapture(event.pointerId)

      const move = (moveEvent: PointerEvent) => {
        const box = surface.current?.getBoundingClientRect()
        if (!box) return

        // x is clamped to 0–1 because CSS requires it; y is deliberately not,
        // since values outside that range are what produce a bounce.
        const x = Math.min(1, Math.max(0, (moveEvent.clientX - box.left) / box.width))
        const y = 1 - (moveEvent.clientY - box.top - PADDING) / SIZE

        setCurve((current) =>
          handle === 1 ? { ...current, x1: x, y1: y } : { ...current, x2: x, y2: y },
        )
      }

      const stop = () => {
        window.removeEventListener('pointermove', move)
        window.removeEventListener('pointerup', stop)
      }

      window.addEventListener('pointermove', move)
      window.addEventListener('pointerup', stop)
    }
  }

  const first = toScreen(curve.x1, curve.y1)
  const second = toScreen(curve.x2, curve.y2)
  const start = toScreen(0, 0)
  const end = toScreen(1, 1)

  return (
    <ToolShell id="bezier">
      <div className="flex flex-wrap gap-2">
        {Object.keys(BEZIER_PRESETS).map((name) => (
          <Button key={name} onClick={() => setCurve(BEZIER_PRESETS[name] as BezierCurve)}>
            {name}
          </Button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[auto_1fr]">
        <Panel label={t('tools.bezier.curve')}>
          <svg
            ref={surface}
            viewBox={`0 0 ${SIZE} ${SIZE + PADDING * 2}`}
            width={SIZE}
            height={SIZE + PADDING * 2}
            className="touch-none"
          >
            <rect
              x={0}
              y={PADDING}
              width={SIZE}
              height={SIZE}
              className="fill-sunken stroke-line"
              strokeWidth={1}
            />
            <line x1={start.x} y1={start.y} x2={first.x} y2={first.y} className="stroke-muted" strokeWidth={1.5} />
            <line x1={end.x} y1={end.y} x2={second.x} y2={second.y} className="stroke-muted" strokeWidth={1.5} />
            <path d={path} fill="none" className="stroke-accent" strokeWidth={2.5} />
            <circle
              cx={first.x}
              cy={first.y}
              r={9}
              className="fill-accent cursor-grab"
              onPointerDown={drag(1)}
            />
            <circle
              cx={second.x}
              cy={second.y}
              r={9}
              className="fill-accent cursor-grab"
              onPointerDown={drag(2)}
            />
          </svg>
        </Panel>

        <div className="space-y-4">
          <Panel label={t('tools.bezier.css')} action={<CopyButton value={toCss(curve)} />}>
            <p className="px-4 py-3 font-mono text-sm break-all">{toCss(curve)}</p>
          </Panel>

          <Panel label={t('tools.bezier.preview')}>
            <div className="space-y-3 p-4">
              <div className="bg-sunken border-line relative h-12 overflow-hidden rounded-lg border">
                <div
                  key={playing}
                  className="bg-accent absolute top-2 size-8 rounded-lg"
                  style={{
                    animation: `quiverkit-slide 1.4s ${toCss(curve)} forwards`,
                  }}
                />
              </div>
              <Button variant="primary" onClick={() => setPlaying((count) => count + 1)}>
                {t('tools.bezier.play')}
              </Button>
            </div>
          </Panel>
        </div>
      </div>

      <p className="text-muted text-sm">{t('tools.bezier.note')}</p>
    </ToolShell>
  )
}
