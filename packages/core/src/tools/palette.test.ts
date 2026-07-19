import { describe, expect, it } from 'vitest'
import { toHex, toOklch, parseColor } from './color.js'
import { buildPalette, harmony, PALETTE_STEPS } from './palette.js'

function palette(base: string) {
  const result = buildPalette(base)
  if (!result.ok) throw new Error(`expected ${base} to build a palette`)
  return result.value
}

describe('buildPalette', () => {
  it('returns one entry per step', () => {
    expect(palette('#3b82f6')).toHaveLength(PALETTE_STEPS.length)
  })

  it('gets darker as the step number rises', () => {
    const entries = palette('#3b82f6')
    const lightness = entries.map((entry) => {
      const parsed = parseColor(entry.hex)
      return parsed.ok ? toOklch(parsed.value).l : 0
    })

    for (let index = 1; index < lightness.length; index += 1) {
      expect(lightness[index]).toBeLessThan(lightness[index - 1] as number)
    }
  })

  it('keeps the hue of the base colour', () => {
    const base = parseColor('#3b82f6')
    if (!base.ok) throw new Error('expected the base to parse')
    const baseHue = toOklch(base.value).h

    for (const entry of palette('#3b82f6')) {
      const parsed = parseColor(entry.hex)
      if (!parsed.ok) throw new Error('expected the entry to parse')
      const { h, c } = toOklch(parsed.value)
      if (c > 0.01) expect(Math.abs(h - baseHue)).toBeLessThan(4)
    }
  })

  it('reports contrast so the readable text colour is obvious', () => {
    const entries = palette('#3b82f6')
    const lightest = entries[0]
    const darkest = entries[entries.length - 1]

    expect(lightest?.onBlack).toBeGreaterThan(lightest?.onWhite ?? 0)
    expect(darkest?.onWhite).toBeGreaterThan(darkest?.onBlack ?? 0)
  })

  it('builds a purely tonal ramp from a grey', () => {
    for (const entry of palette('#808080')) {
      const parsed = parseColor(entry.hex)
      expect(parsed.ok && toOklch(parsed.value).c).toBeLessThan(0.01)
    }
  })

  it('rejects a colour it cannot read', () => {
    expect(buildPalette('rainbow')).toEqual({ ok: false, error: 'error.invalidColor' })
  })
})

describe('harmony', () => {
  it('returns the expected number of colours for each scheme', () => {
    expect(harmony('#3b82f6', 'complementary')).toMatchObject({ ok: true })
    expect((harmony('#3b82f6', 'triadic') as { value: string[] }).value).toHaveLength(3)
    expect((harmony('#3b82f6', 'tetradic') as { value: string[] }).value).toHaveLength(4)
  })

  it('starts from the colour it was given', () => {
    const result = harmony('#3b82f6', 'analogous')
    if (!result.ok) throw new Error('expected the harmony to build')

    const base = parseColor('#3b82f6')
    expect(base.ok && toHex(base.value)).toBe('#3b82f6')
    expect(result.value[1]).toBeTruthy()
  })
})
