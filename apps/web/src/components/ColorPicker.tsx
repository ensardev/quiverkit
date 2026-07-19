import { hsvToRgb, toHex, toHsv, type Hsv, type Rgb } from '@quiverkit/core'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

interface DragAreaProps {
  className: string
  style?: React.CSSProperties
  onMove: (x: number, y: number) => void
  children: React.ReactNode
  label: string
}

/**
 * Pointer capture is what makes dragging feel right: once the pointer is
 * captured, moving outside the element — or off the window entirely — keeps
 * sending events here instead of silently stopping.
 */
function DragArea({ className, style, onMove, children, label }: DragAreaProps) {
  const surface = useRef<HTMLDivElement>(null)

  function report(event: React.PointerEvent) {
    const box = surface.current?.getBoundingClientRect()
    if (!box) return

    onMove(
      Math.min(1, Math.max(0, (event.clientX - box.left) / box.width)),
      Math.min(1, Math.max(0, (event.clientY - box.top) / box.height)),
    )
  }

  return (
    <div
      ref={surface}
      role="slider"
      aria-label={label}
      tabIndex={0}
      className={`relative cursor-crosshair touch-none ${className}`}
      style={style}
      onPointerDown={(event) => {
        event.currentTarget.setPointerCapture(event.pointerId)
        report(event)
      }}
      onPointerMove={(event) => {
        if (event.currentTarget.hasPointerCapture(event.pointerId)) report(event)
      }}
    >
      {children}
    </div>
  )
}

function Handle({ x, y }: { x: string; y?: string }) {
  return (
    <span
      className="pointer-events-none absolute size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.4)]"
      style={{ left: x, top: y ?? '50%' }}
    />
  )
}

interface NumberFieldProps {
  label: string
  value: number
  max: number
  step?: number
  onChange: (value: number) => void
}

function NumberField({ label, value, max, step = 1, onChange }: NumberFieldProps) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-muted text-center text-xs">{label}</span>
      <input
        type="number"
        min={0}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="border-line bg-sunken w-full rounded-lg border px-2 py-1 text-center font-mono text-sm focus:outline-none"
      />
    </label>
  )
}

interface ColorPickerProps {
  value: Rgb
  onChange: (value: Rgb) => void
  onClose: () => void
}

export default function ColorPicker({ value, onChange, onClose }: ColorPickerProps) {
  const { t } = useTranslation()
  const container = useRef<HTMLDivElement>(null)

  /**
   * Hue lives here rather than being derived from the RGB value on every
   * render. Black and white carry no hue, so a round-trip through RGB would
   * reset the slider to red the moment the handle touched an edge.
   */
  const [hsv, setHsv] = useState<Hsv>(() => toHsv(value))

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (!container.current?.contains(event.target as Node)) onClose()
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [onClose])

  function update(next: Hsv) {
    setHsv(next)
    onChange(hsvToRgb(next))
  }

  function updateRgb(channel: 'r' | 'g' | 'b', amount: number) {
    const next = { ...value, [channel]: Math.min(255, Math.max(0, amount)) }
    setHsv({ ...toHsv(next), h: toHsv(next).s === 0 ? hsv.h : toHsv(next).h })
    onChange(next)
  }

  const opaque = toHex({ ...value, a: 1 })

  return (
    <div
      ref={container}
      className="border-line bg-surface absolute top-12 left-0 z-20 w-64 space-y-3 rounded-xl border p-3 shadow-xl"
    >
      <DragArea
        label={t('tools.color.saturation')}
        className="h-40 w-full overflow-hidden rounded-lg"
        style={{
          background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, hsl(${hsv.h} 100% 50%))`,
        }}
        onMove={(x, y) => update({ ...hsv, s: x * 100, v: (1 - y) * 100 })}
      >
        <Handle x={`${hsv.s}%`} y={`${100 - hsv.v}%`} />
      </DragArea>

      <DragArea
        label={t('tools.color.hue')}
        className="h-4 w-full rounded-full"
        style={{
          background:
            'linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)',
        }}
        onMove={(x) => update({ ...hsv, h: x * 360 })}
      >
        <Handle x={`${(hsv.h / 360) * 100}%`} />
      </DragArea>

      <DragArea
        label={t('tools.color.alpha')}
        className="h-4 w-full rounded-full"
        style={{
          backgroundImage: `linear-gradient(to right, transparent, ${opaque}), repeating-conic-gradient(#bbb 0% 25%, #fff 0% 50%)`,
          backgroundSize: 'auto, 12px 12px',
        }}
        onMove={(x) => update({ ...hsv, a: x })}
      >
        <Handle x={`${hsv.a * 100}%`} />
      </DragArea>

      <div className="grid grid-cols-4 gap-2">
        <NumberField label="R" value={value.r} max={255} onChange={(next) => updateRgb('r', next)} />
        <NumberField label="G" value={value.g} max={255} onChange={(next) => updateRgb('g', next)} />
        <NumberField label="B" value={value.b} max={255} onChange={(next) => updateRgb('b', next)} />
        <NumberField
          label="A"
          value={Math.round(value.a * 100) / 100}
          max={1}
          step={0.01}
          onChange={(next) => update({ ...hsv, a: Math.min(1, Math.max(0, next)) })}
        />
      </div>
    </div>
  )
}
