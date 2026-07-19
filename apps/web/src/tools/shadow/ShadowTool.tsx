import { elevation, shadowToCss, type Shadow } from '@quiverkit/core'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, CopyButton, Panel, ToolShell } from '@/components/ui'

const FIELDS = [
  { key: 'offsetX', min: -50, max: 50 },
  { key: 'offsetY', min: -50, max: 50 },
  { key: 'blur', min: 0, max: 100 },
  { key: 'spread', min: -50, max: 50 },
] as const

/**
 * A black shadow is invisible against a dark surface, so the starting colour
 * follows the theme. Dark interfaces really do use light shadows for the same
 * reason — the light source has to contrast with what it falls on.
 */
function isDarkTheme(): boolean {
  return document.documentElement.dataset.theme === 'dark'
}

function defaultShadow(): Shadow {
  return {
    offsetX: 0,
    offsetY: 4,
    blur: 12,
    spread: -2,
    color: isDarkTheme() ? '#ffffff40' : '#00000040',
    inset: false,
  }
}

export default function ShadowTool() {
  const { t } = useTranslation()
  const [shadows, setShadows] = useState<Shadow[]>(() => [defaultShadow()])

  const preset = (level: number) => elevation(level, isDarkTheme() ? '0 0% 100%' : '0 0% 0%')

  const css = useMemo(() => shadowToCss(shadows), [shadows])

  const update = (index: number, patch: Partial<Shadow>) =>
    setShadows((current) =>
      current.map((shadow, position) => (position === index ? { ...shadow, ...patch } : shadow)),
    )

  return (
    <ToolShell id="shadow">
      <div className="bg-sunken border-line flex h-56 items-center justify-center rounded-xl border">
        <div className="bg-surface size-32 rounded-2xl" style={{ boxShadow: css }} />
      </div>

      <div className="flex flex-wrap gap-2">
        <Button onClick={() => setShadows(preset(2))}>{t('tools.shadow.soft')}</Button>
        <Button onClick={() => setShadows(preset(4))}>{t('tools.shadow.deep')}</Button>
        <Button
          onClick={() =>
            setShadows((current) => [
              ...current,
              { ...defaultShadow(), offsetY: 8, blur: 24, spread: -4 },
            ])
          }
        >
          {t('tools.shadow.addLayer')}
        </Button>
      </div>

      {shadows.map((shadow, index) => (
        <Panel
          key={index}
          label={t('tools.shadow.layer', { number: index + 1 })}
          action={
            shadows.length > 1 && (
              <button
                type="button"
                onClick={() => setShadows((current) => current.filter((_, position) => position !== index))}
                className="text-muted hover:text-danger cursor-pointer text-xs"
              >
                {t('common.clear')}
              </button>
            )
          }
        >
          <div className="space-y-2 p-4">
            {FIELDS.map((field) => (
              <label key={field.key} className="flex items-center gap-3 text-sm">
                <span className="text-muted w-20">{t(`tools.shadow.${field.key}`)}</span>
                <input
                  type="range"
                  min={field.min}
                  max={field.max}
                  value={shadow[field.key]}
                  onChange={(event) => update(index, { [field.key]: Number(event.target.value) })}
                  className="accent-accent flex-1 cursor-pointer"
                />
                <span className="w-12 text-right font-mono">{shadow[field.key]}px</span>
              </label>
            ))}

            <div className="flex items-center gap-3 pt-1">
              <input
                type="color"
                value={shadow.color.slice(0, 7)}
                onChange={(event) => update(index, { color: event.target.value })}
                className="border-line size-9 cursor-pointer rounded-lg border bg-transparent"
              />
              <input
                value={shadow.color}
                onChange={(event) => update(index, { color: event.target.value })}
                className="border-line bg-sunken w-36 rounded-lg border px-2 py-1.5 font-mono text-sm focus:outline-none"
              />
              <label className="text-muted flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={shadow.inset}
                  onChange={(event) => update(index, { inset: event.target.checked })}
                  className="accent-accent size-4 cursor-pointer"
                />
                inset
              </label>
            </div>
          </div>
        </Panel>
      ))}

      <Panel label="CSS" action={<CopyButton value={`box-shadow: ${css};`} />}>
        <p className="px-4 py-3 font-mono text-sm break-all">box-shadow: {css};</p>
      </Panel>

      <p className="text-muted text-sm">{t('tools.shadow.note')}</p>
    </ToolShell>
  )
}
