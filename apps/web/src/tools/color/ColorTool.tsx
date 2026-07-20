import { blend, checkContrast, parseColor, toHex, toHsl, toOklch, type Rgb } from '@quiverkit/core'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useToolInput } from '@/hooks/useToolInput'
import ColorPicker from '@/components/ColorPicker'
import { DataRow, ErrorNote, Panel, ToolShell } from '@/components/ui'

interface ColorFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  swatch: Rgb | null
}

function ColorField({ label, value, onChange, swatch }: ColorFieldProps) {
  const { t } = useTranslation()
  const [picking, setPicking] = useState(false)

  return (
    <div className="relative flex flex-1 items-center gap-3">
      <button
        type="button"
        onClick={() => setPicking((open) => !open)}
        aria-label={t('tools.color.pick')}
        title={t('tools.color.pick')}
        // The checkerboard sits underneath so a semi-transparent colour reads as
        // transparent rather than as a lighter shade.
        className="border-line hover:border-accent size-10 shrink-0 cursor-pointer rounded-lg border transition-colors"
        style={{
          backgroundImage: swatch
            ? `linear-gradient(${toHex(swatch)}, ${toHex(swatch)}), repeating-conic-gradient(#bbb 0% 25%, #fff 0% 50%)`
            : undefined,
          backgroundSize: 'auto, 10px 10px',
        }}
      />

      {picking && swatch && (
        <ColorPicker
          value={swatch}
          onChange={(next) => onChange(toHex(next))}
          onClose={() => setPicking(false)}
        />
      )}

      <label className="w-full">
        <span className="sr-only">{label}</span>
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="#3b82f6"
          className="border-line bg-surface placeholder:text-muted focus:border-accent w-full rounded-lg border px-3 py-2 font-mono text-sm transition-colors focus:outline-none"
        />
      </label>
    </div>
  )
}

function Badge({ label, passes }: { label: string; passes: boolean }) {
  return (
    <div
      className={`rounded-lg px-3 py-2 text-center text-sm font-medium ${
        passes ? 'bg-accent-soft text-accent' : 'bg-danger-soft text-danger'
      }`}
    >
      <div className="text-xs opacity-80">{label}</div>
      {passes ? '✓' : '✕'}
    </div>
  )
}

export default function ColorTool() {
  const { t } = useTranslation()
  const { value: foreground, setValue: setForeground } = useToolInput('#1c1917')
  const [background, setBackground] = useState('#faf9f7')

  const parsedForeground = useMemo(() => parseColor(foreground), [foreground])
  const parsedBackground = useMemo(() => parseColor(background), [background])

  const colour = parsedForeground.ok ? parsedForeground.value : null

  const contrast = useMemo(
    () =>
      parsedForeground.ok && parsedBackground.ok
        ? checkContrast(parsedForeground.value, parsedBackground.value)
        : null,
    [parsedForeground, parsedBackground],
  )

  const formats = useMemo(() => {
    if (!colour) return []

    const hsl = toHsl(colour)
    const oklch = toOklch(colour)
    const alpha = colour.a < 1 ? ` / ${Math.round(colour.a * 100)}%` : ''

    return [
      { key: 'hex', label: 'HEX', value: toHex(colour) },
      { key: 'rgb', label: 'RGB', value: `rgb(${colour.r} ${colour.g} ${colour.b}${alpha})` },
      { key: 'hsl', label: 'HSL', value: `hsl(${hsl.h} ${hsl.s}% ${hsl.l}%${alpha})` },
      { key: 'oklch', label: 'OKLCH', value: `oklch(${oklch.l} ${oklch.c} ${oklch.h}${alpha})` },
    ]
  }, [colour])

  return (
    <ToolShell id="color">
      <div className="flex flex-col gap-3 sm:flex-row">
        <ColorField
          label={t('tools.color.foreground')}
          value={foreground}
          onChange={setForeground}
          swatch={colour}
        />
        <ColorField
          label={t('tools.color.background')}
          value={background}
          onChange={setBackground}
          swatch={parsedBackground.ok ? parsedBackground.value : null}
        />
      </div>

      <Panel label={t('tools.color.formats')}>
        {parsedForeground.ok ? (
          <div>
            {formats.map((format) => (
              <DataRow key={format.key} label={format.label} value={format.value} />
            ))}
          </div>
        ) : (
          <ErrorNote>{t(parsedForeground.error)}</ErrorNote>
        )}
      </Panel>

      {contrast && (
        <Panel label={t('tools.color.contrast')}>
          <div className="space-y-4 p-4">
            <div
              className="border-line rounded-lg border p-6 text-center"
              style={{
                // The preview has to show the same thing the ratio measures:
                // the text keeps its opacity, and a translucent background is
                // flattened onto white exactly as `contrastRatio` assumes.
                backgroundColor: parsedBackground.ok
                  ? toHex(blend(parsedBackground.value, { r: 255, g: 255, b: 255, a: 1 }))
                  : undefined,
                color: parsedForeground.ok ? toHex(parsedForeground.value) : undefined,
              }}
            >
              <p className="text-base">{t('tools.color.sample')}</p>
              <p className="mt-1 text-2xl font-semibold">{t('tools.color.sampleLarge')}</p>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="font-mono text-3xl font-semibold">{contrast.ratio}</span>
              <span className="text-muted text-sm">{t('tools.color.ratio')}</span>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <Badge label={t('tools.color.normalAA')} passes={contrast.normalAA} />
              <Badge label={t('tools.color.normalAAA')} passes={contrast.normalAAA} />
              <Badge label={t('tools.color.largeAA')} passes={contrast.largeAA} />
              <Badge label={t('tools.color.largeAAA')} passes={contrast.largeAAA} />
            </div>
          </div>
        </Panel>
      )}

      <p className="text-muted text-sm">{t('tools.color.alphaNote')}</p>
      <p className="text-muted text-sm">{t('tools.color.oklchNote')}</p>
    </ToolShell>
  )
}
