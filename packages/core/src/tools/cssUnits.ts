import { err, ok, type Result } from '../result.js'

export const CSS_UNITS = ['px', 'rem', 'em', 'pt', 'percent'] as const

export type CssUnit = (typeof CSS_UNITS)[number]

export interface UnitContext {
  /** The document's font size — 16px unless the user changed it. */
  rootFontSize: number
  /** The font size of the element's parent, which `em` is relative to. */
  parentFontSize: number
}

export const DEFAULT_CONTEXT: UnitContext = { rootFontSize: 16, parentFontSize: 16 }

function toPixels(value: number, unit: CssUnit, context: UnitContext): number {
  switch (unit) {
    case 'px':
      return value
    case 'rem':
      return value * context.rootFontSize
    case 'em':
      return value * context.parentFontSize
    case 'pt':
      // CSS defines 1pt as 1/72 inch and 1in as 96px, regardless of the screen.
      return (value * 96) / 72
    case 'percent':
      return (value / 100) * context.parentFontSize
  }
}

function fromPixels(pixels: number, unit: CssUnit, context: UnitContext): number {
  switch (unit) {
    case 'px':
      return pixels
    case 'rem':
      return pixels / context.rootFontSize
    case 'em':
      return pixels / context.parentFontSize
    case 'pt':
      return (pixels * 72) / 96
    case 'percent':
      return (pixels / context.parentFontSize) * 100
  }
}

export interface UnitView {
  unit: CssUnit
  value: number
}

export function convertUnits(
  value: number,
  from: CssUnit,
  context: UnitContext = DEFAULT_CONTEXT,
): Result<UnitView[]> {
  if (!Number.isFinite(value)) return err('error.invalidNumber')
  if (context.rootFontSize <= 0 || context.parentFontSize <= 0) return err('error.invalidNumber')

  const pixels = toPixels(value, from, context)

  return ok(
    CSS_UNITS.map((unit) => ({
      unit,
      value: Math.round(fromPixels(pixels, unit, context) * 10000) / 10000,
    })),
  )
}
