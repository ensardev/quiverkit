import { err, ok, type Result } from '../result.js'
import {
  contrastRatio,
  fitToGamut,
  oklchToRgb,
  parseColor,
  toHex,
  toOklch,
  type Rgb,
} from './color.js'

/** The step names Tailwind popularised, which most teams now recognise. */
export const PALETTE_STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const

export interface PaletteEntry {
  step: number
  hex: string
  /** Contrast against white and black, so the usable text colour is obvious. */
  onWhite: number
  onBlack: number
}

const WHITE: Rgb = { r: 255, g: 255, b: 255, a: 1 }
const BLACK: Rgb = { r: 0, g: 0, b: 0, a: 1 }

/** Target lightness for each step, in OKLCH terms. */
const LIGHTNESS: Record<number, number> = {
  50: 0.97,
  100: 0.94,
  200: 0.88,
  300: 0.8,
  400: 0.71,
  500: 0.63,
  600: 0.55,
  700: 0.47,
  800: 0.39,
  900: 0.32,
  950: 0.24,
}

/**
 * Built in OKLCH rather than HSL: equal steps in its lightness look equally
 * different to the eye, so the scale stays even instead of bunching up in the
 * mid tones the way an HSL ramp does. Chroma is eased down at both ends, since
 * very light and very dark colours cannot hold full saturation.
 */
export function buildPalette(base: string): Result<PaletteEntry[]> {
  const parsed = parseColor(base)
  if (!parsed.ok) return parsed

  const source = toOklch(parsed.value)
  if (source.c === 0) {
    // A grey has no hue to preserve, so the ramp is purely tonal.
    return ok(
      PALETTE_STEPS.map((step) => {
        const colour = oklchToRgb({ l: LIGHTNESS[step] ?? 0.5, c: 0, h: 0, a: 1 })
        return entry(step, colour)
      }),
    )
  }

  return ok(
    PALETTE_STEPS.map((step) => {
      const lightness = LIGHTNESS[step] ?? 0.5
      const distance = Math.abs(lightness - 0.63)
      const chroma = Math.max(0, source.c * (1 - distance * 0.55))

      // Fitting rather than clamping is what keeps the hue steady: the very
      // light and very dark steps simply carry less chroma.
      const fitted = fitToGamut({ l: lightness, c: chroma, h: source.h, a: 1 })
      return entry(step, oklchToRgb(fitted))
    }),
  )
}

function entry(step: number, colour: Rgb): PaletteEntry {
  return {
    step,
    hex: toHex(colour),
    onWhite: contrastRatio(colour, WHITE),
    onBlack: contrastRatio(colour, BLACK),
  }
}

export type HarmonyKind = 'complementary' | 'analogous' | 'triadic' | 'tetradic'

export function harmony(base: string, kind: HarmonyKind): Result<string[]> {
  const parsed = parseColor(base)
  if (!parsed.ok) return parsed

  const source = toOklch(parsed.value)
  const offsets: Record<HarmonyKind, number[]> = {
    complementary: [0, 180],
    analogous: [-30, 0, 30],
    triadic: [0, 120, 240],
    tetradic: [0, 90, 180, 270],
  }

  const angles = offsets[kind]
  if (!angles) return err('error.invalidColor')

  return ok(
    angles.map((offset) =>
      toHex(oklchToRgb(fitToGamut({ ...source, h: (((source.h + offset) % 360) + 360) % 360 }))),
    ),
  )
}
