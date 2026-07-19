import { err, ok, type Result } from '../result.js'

export interface Rgb {
  /** 0–255 */
  r: number
  g: number
  b: number
  /** 0–1 */
  a: number
}

export interface Hsl {
  /** 0–360 */
  h: number
  /** 0–100 */
  s: number
  l: number
  a: number
}

export interface Hsv {
  /** 0–360 */
  h: number
  /** 0–100 */
  s: number
  v: number
  a: number
}

export interface Oklch {
  /** 0–1 */
  l: number
  c: number
  /** 0–360 */
  h: number
  a: number
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

const round = (value: number, decimals = 0) => {
  const factor = 10 ** decimals
  return Math.round(value * factor) / factor
}

function expandShorthand(hex: string): string {
  return hex.length <= 4 ? [...hex].map((character) => character + character).join('') : hex
}

function parseHex(input: string): Rgb | null {
  const hex = expandShorthand(input.replace('#', ''))
  if (!/^[0-9a-f]{6}([0-9a-f]{2})?$/i.test(hex)) return null

  const value = (offset: number) => Number.parseInt(hex.slice(offset, offset + 2), 16)

  return {
    r: value(0),
    g: value(2),
    b: value(4),
    a: hex.length === 8 ? round(value(6) / 255, 3) : 1,
  }
}

/** Accepts both the legacy `rgb(1, 2, 3)` and the modern `rgb(1 2 3 / 50%)`. */
function numbers(input: string): number[] {
  return [...input.matchAll(/-?[\d.]+%?/g)].map((match) => {
    const raw = match[0]
    return raw.endsWith('%') ? Number.parseFloat(raw) : Number.parseFloat(raw)
  })
}

function alphaOf(values: number[], index: number, raw: string): number {
  const value = values[index]
  if (value === undefined) return 1

  // "/ 50%" and "/ 0.5" mean the same thing.
  return raw.includes('%', raw.lastIndexOf('/')) && raw.includes('/') ? value / 100 : value
}

function hslToRgb({ h, s, l, a }: Hsl): Rgb {
  const saturation = s / 100
  const lightness = l / 100
  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation
  const secondary = chroma * (1 - Math.abs(((h / 60) % 2) - 1))
  const match = lightness - chroma / 2

  const sector = Math.floor(((h % 360) + 360) % 360 / 60)
  const table: [number, number, number][] = [
    [chroma, secondary, 0],
    [secondary, chroma, 0],
    [0, chroma, secondary],
    [0, secondary, chroma],
    [secondary, 0, chroma],
    [chroma, 0, secondary],
  ]

  const [r, g, b] = table[sector] ?? [0, 0, 0]

  return {
    r: Math.round((r + match) * 255),
    g: Math.round((g + match) * 255),
    b: Math.round((b + match) * 255),
    a,
  }
}

export function parseColor(input: string): Result<Rgb> {
  const trimmed = input.trim()
  if (trimmed === '') return err('error.emptyInput')

  if (trimmed.startsWith('#') || /^[0-9a-f]{3,8}$/i.test(trimmed)) {
    const parsed = parseHex(trimmed)
    return parsed ? ok(parsed) : err('error.invalidColor')
  }

  const values = numbers(trimmed)

  if (/^rgba?\(/i.test(trimmed) && values.length >= 3) {
    const [r, g, b] = values as [number, number, number]
    return ok({
      r: clamp(Math.round(r), 0, 255),
      g: clamp(Math.round(g), 0, 255),
      b: clamp(Math.round(b), 0, 255),
      a: clamp(alphaOf(values, 3, trimmed), 0, 1),
    })
  }

  if (/^hsla?\(/i.test(trimmed) && values.length >= 3) {
    const [h, s, l] = values as [number, number, number]
    return ok(hslToRgb({ h, s: clamp(s, 0, 100), l: clamp(l, 0, 100), a: clamp(alphaOf(values, 3, trimmed), 0, 1) }))
  }

  return err('error.invalidColor')
}

export function toHex({ r, g, b, a }: Rgb): string {
  const pair = (value: number) => clamp(Math.round(value), 0, 255).toString(16).padStart(2, '0')
  const alpha = a < 1 ? pair(a * 255) : ''
  return `#${pair(r)}${pair(g)}${pair(b)}${alpha}`
}

export function toHsl({ r, g, b, a }: Rgb): Hsl {
  const red = r / 255
  const green = g / 255
  const blue = b / 255

  const max = Math.max(red, green, blue)
  const min = Math.min(red, green, blue)
  const delta = max - min
  const lightness = (max + min) / 2

  let hue = 0
  if (delta !== 0) {
    if (max === red) hue = ((green - blue) / delta) % 6
    else if (max === green) hue = (blue - red) / delta + 2
    else hue = (red - green) / delta + 4
    hue *= 60
    if (hue < 0) hue += 360
  }

  const saturation = delta === 0 ? 0 : delta / (1 - Math.abs(2 * lightness - 1))

  return {
    h: round(hue, 1),
    s: round(saturation * 100, 1),
    l: round(lightness * 100, 1),
    a,
  }
}

/**
 * HSV, not HSL, is what a colour picker's square is built on: the horizontal
 * axis is saturation and the vertical one is value, which is exactly the shape
 * of that gradient.
 */
export function toHsv({ r, g, b, a }: Rgb): Hsv {
  const red = r / 255
  const green = g / 255
  const blue = b / 255

  const max = Math.max(red, green, blue)
  const delta = max - Math.min(red, green, blue)

  let hue = 0
  if (delta !== 0) {
    if (max === red) hue = ((green - blue) / delta) % 6
    else if (max === green) hue = (blue - red) / delta + 2
    else hue = (red - green) / delta + 4
    hue *= 60
    if (hue < 0) hue += 360
  }

  return {
    h: round(hue, 1),
    s: round((max === 0 ? 0 : delta / max) * 100, 1),
    v: round(max * 100, 1),
    a,
  }
}

export function hsvToRgb({ h, s, v, a }: Hsv): Rgb {
  const saturation = clamp(s, 0, 100) / 100
  const value = clamp(v, 0, 100) / 100
  const chroma = value * saturation
  const secondary = chroma * (1 - Math.abs(((h / 60) % 2) - 1))
  const match = value - chroma

  const sector = Math.floor((((h % 360) + 360) % 360) / 60)
  const table: [number, number, number][] = [
    [chroma, secondary, 0],
    [secondary, chroma, 0],
    [0, chroma, secondary],
    [0, secondary, chroma],
    [secondary, 0, chroma],
    [chroma, 0, secondary],
  ]

  const [red, green, blue] = table[sector] ?? [0, 0, 0]

  return {
    r: Math.round((red + match) * 255),
    g: Math.round((green + match) * 255),
    b: Math.round((blue + match) * 255),
    a: clamp(a, 0, 1),
  }
}

/** sRGB stores values gamma-encoded; every physical calculation needs them linear. */
function linearise(channel: number): number {
  const value = channel / 255
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
}

/**
 * OKLCH is the colour space CSS gained for a reason: unlike HSL, equal steps in
 * its lightness look equally different to the eye, so palettes built in it stay
 * balanced. Conversion goes sRGB → linear → OKLab → polar form.
 */
export function toOklch({ r, g, b, a }: Rgb): Oklch {
  const red = linearise(r)
  const green = linearise(g)
  const blue = linearise(b)

  const long = Math.cbrt(0.4122214708 * red + 0.5363325363 * green + 0.0514459929 * blue)
  const medium = Math.cbrt(0.2119034982 * red + 0.6806995451 * green + 0.1073969566 * blue)
  const short = Math.cbrt(0.0883024619 * red + 0.2817188376 * green + 0.6299787005 * blue)

  const lightness = 0.2104542553 * long + 0.793617785 * medium - 0.0040720468 * short
  const greenRed = 1.9779984951 * long - 2.428592205 * medium + 0.4505937099 * short
  const blueYellow = 0.0259040371 * long + 0.7827717662 * medium - 0.808675766 * short

  const chroma = Math.sqrt(greenRed ** 2 + blueYellow ** 2)
  const hue = chroma < 1e-6 ? 0 : ((Math.atan2(blueYellow, greenRed) * 180) / Math.PI + 360) % 360

  return { l: round(lightness, 4), c: round(chroma, 4), h: round(hue, 2), a }
}

export function relativeLuminance({ r, g, b }: Rgb): number {
  return 0.2126 * linearise(r) + 0.7152 * linearise(g) + 0.0722 * linearise(b)
}

/** WCAG 2.1 contrast: 1 for identical colours, 21 for black against white. */
export function contrastRatio(foreground: Rgb, background: Rgb): number {
  const first = relativeLuminance(foreground)
  const second = relativeLuminance(background)
  const lighter = Math.max(first, second)
  const darker = Math.min(first, second)

  return round((lighter + 0.05) / (darker + 0.05), 2)
}

export interface ContrastVerdict {
  ratio: number
  normalAA: boolean
  normalAAA: boolean
  largeAA: boolean
  largeAAA: boolean
}

/** "Large" means 18pt, or 14pt bold — roughly 24px and 18.66px. */
export function checkContrast(foreground: Rgb, background: Rgb): ContrastVerdict {
  const ratio = contrastRatio(foreground, background)

  return {
    ratio,
    normalAA: ratio >= 4.5,
    normalAAA: ratio >= 7,
    largeAA: ratio >= 3,
    largeAAA: ratio >= 4.5,
  }
}
