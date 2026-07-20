import { parseColor, relativeLuminance, toHex, type Rgb } from './color.js'
import { err, ok, type Result } from '../result.js'

export const VISION_TYPES = [
  'normal',
  'protanopia',
  'deuteranopia',
  'tritanopia',
  'achromatopsia',
] as const

export type VisionType = (typeof VISION_TYPES)[number]

/**
 * Machado, Oliveira and Fernandes (2009) — sRGB matrices at full severity. They
 * are approximations of how the three kinds of colour blindness collapse the
 * spectrum, and are the same ones browsers and design tools use.
 *
 * Deuteranopia alone affects roughly one man in twelve, which is why a palette
 * that separates only by hue fails for far more people than designers expect.
 */
const MATRICES: Record<Exclude<VisionType, 'normal' | 'achromatopsia'>, number[]> = {
  protanopia: [0.152286, 1.052583, -0.204868, 0.114503, 0.786281, 0.099216, -0.003882, -0.048116, 1.051998],
  deuteranopia: [0.367322, 0.860646, -0.227968, 0.280085, 0.672501, 0.047413, -0.01182, 0.04294, 0.968881],
  tritanopia: [1.255528, -0.076749, -0.178779, -0.078411, 0.930809, 0.147602, 0.004733, 0.691367, 0.3039],
}

const clamp = (value: number) => Math.min(255, Math.max(0, Math.round(value)))

export function simulate(colour: Rgb, type: VisionType): Rgb {
  if (type === 'normal') return colour

  if (type === 'achromatopsia') {
    // Weighted by luminance rather than a flat average, so the grey matches how
    // bright the colour actually looks.
    const grey = clamp(relativeLuminance(colour) ** (1 / 2.2) * 255)
    return { r: grey, g: grey, b: grey, a: colour.a }
  }

  const m = MATRICES[type]

  return {
    r: clamp((m[0] as number) * colour.r + (m[1] as number) * colour.g + (m[2] as number) * colour.b),
    g: clamp((m[3] as number) * colour.r + (m[4] as number) * colour.g + (m[5] as number) * colour.b),
    b: clamp((m[6] as number) * colour.r + (m[7] as number) * colour.g + (m[8] as number) * colour.b),
    a: colour.a,
  }
}

export interface VisionView {
  type: VisionType
  hex: string
}

export function simulateAll(input: string): Result<VisionView[]> {
  const parsed = parseColor(input)
  if (!parsed.ok) return parsed

  return ok(VISION_TYPES.map((type) => ({ type, hex: toHex(simulate(parsed.value, type)) })))
}

/**
 * How far apart two colours stay once a viewer's cones are missing. A palette
 * that relies on hue alone can collapse to nearly the same shade here, which is
 * the failure the tool is meant to expose.
 */
export function distanceUnder(first: Rgb, second: Rgb, type: VisionType): number {
  const a = simulate(first, type)
  const b = simulate(second, type)

  return Math.round(Math.sqrt((a.r - b.r) ** 2 + (a.g - b.g) ** 2 + (a.b - b.b) ** 2))
}

export function comparePair(first: string, second: string): Result<Record<VisionType, number>> {
  const left = parseColor(first)
  if (!left.ok) return left

  const right = parseColor(second)
  if (!right.ok) return right

  const entries = VISION_TYPES.map((type) => [type, distanceUnder(left.value, right.value, type)])
  const result = Object.fromEntries(entries) as Record<VisionType, number>

  return Object.keys(result).length === VISION_TYPES.length ? ok(result) : err('error.invalidColor')
}
