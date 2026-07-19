import { describe, expect, it } from 'vitest'
import { checkContrast, contrastRatio, parseColor, toHex, toHsl, toOklch } from './color.js'

function rgb(input: string) {
  const result = parseColor(input)
  if (!result.ok) throw new Error(`expected ${input} to parse, got ${result.error}`)
  return result.value
}

describe('parseColor', () => {
  it('reads hex in every length', () => {
    expect(rgb('#f00')).toEqual({ r: 255, g: 0, b: 0, a: 1 })
    expect(rgb('#ff0000')).toEqual({ r: 255, g: 0, b: 0, a: 1 })
    expect(rgb('ff0000')).toEqual({ r: 255, g: 0, b: 0, a: 1 })
    expect(rgb('#ff000080').a).toBeCloseTo(0.5, 1)
  })

  it('reads both rgb syntaxes', () => {
    expect(rgb('rgb(255, 128, 0)')).toEqual({ r: 255, g: 128, b: 0, a: 1 })
    expect(rgb('rgb(255 128 0)')).toEqual({ r: 255, g: 128, b: 0, a: 1 })
    expect(rgb('rgba(255, 128, 0, 0.5)').a).toBe(0.5)
  })

  it('reads hsl', () => {
    expect(rgb('hsl(0, 100%, 50%)')).toEqual({ r: 255, g: 0, b: 0, a: 1 })
    expect(rgb('hsl(120 100% 50%)')).toEqual({ r: 0, g: 255, b: 0, a: 1 })
    expect(rgb('hsl(240 100% 50%)')).toEqual({ r: 0, g: 0, b: 255, a: 1 })
  })

  it('rejects nonsense', () => {
    expect(parseColor('#gg0000')).toEqual({ ok: false, error: 'error.invalidColor' })
    expect(parseColor('rainbow')).toEqual({ ok: false, error: 'error.invalidColor' })
    expect(parseColor('  ')).toEqual({ ok: false, error: 'error.emptyInput' })
  })
})

describe('conversions', () => {
  it('round-trips through hex', () => {
    expect(toHex(rgb('rgb(18, 52, 86)'))).toBe('#123456')
  })

  it('converts to hsl', () => {
    expect(toHsl(rgb('#ff0000'))).toEqual({ h: 0, s: 100, l: 50, a: 1 })
    expect(toHsl(rgb('#808080'))).toMatchObject({ s: 0 })
  })

  it('converts to oklch', () => {
    expect(toOklch(rgb('#ffffff'))).toMatchObject({ c: 0, h: 0 })
    expect(toOklch(rgb('#ffffff')).l).toBeCloseTo(1, 2)
    expect(toOklch(rgb('#000000')).l).toBeCloseTo(0, 2)

    const red = toOklch(rgb('#ff0000'))
    expect(red.l).toBeCloseTo(0.628, 2)
    expect(red.c).toBeCloseTo(0.2577, 2)
    expect(red.h).toBeCloseTo(29.23, 0)
  })
})

describe('contrast', () => {
  it('gives 21 for black on white and 1 for a colour on itself', () => {
    expect(contrastRatio(rgb('#000'), rgb('#fff'))).toBe(21)
    expect(contrastRatio(rgb('#4a90d9'), rgb('#4a90d9'))).toBe(1)
  })

  it('does not depend on which colour is the foreground', () => {
    expect(contrastRatio(rgb('#333'), rgb('#eee'))).toBe(contrastRatio(rgb('#eee'), rgb('#333')))
  })

  it('applies the WCAG thresholds', () => {
    expect(checkContrast(rgb('#000'), rgb('#fff'))).toMatchObject({
      normalAA: true,
      normalAAA: true,
      largeAA: true,
      largeAAA: true,
    })

    // Mid grey on white lands between the large-text and normal-text bars.
    const grey = checkContrast(rgb('#949494'), rgb('#ffffff'))
    expect(grey.largeAA).toBe(true)
    expect(grey.normalAA).toBe(false)
  })
})
