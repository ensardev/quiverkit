import { describe, expect, it } from 'vitest'
import { parseColor } from './color.js'
import { comparePair, distanceUnder, simulate, simulateAll } from './vision.js'

function rgb(hex: string) {
  const result = parseColor(hex)
  if (!result.ok) throw new Error(`expected ${hex} to parse`)
  return result.value
}

describe('simulate', () => {
  it('leaves a colour untouched for normal vision', () => {
    expect(simulate(rgb('#3b82f6'), 'normal')).toEqual(rgb('#3b82f6'))
  })

  it('keeps greys grey under every kind', () => {
    for (const type of ['protanopia', 'deuteranopia', 'tritanopia', 'achromatopsia'] as const) {
      const result = simulate(rgb('#808080'), type)
      expect(Math.abs(result.r - result.g)).toBeLessThan(6)
      expect(Math.abs(result.g - result.b)).toBeLessThan(6)
    }
  })

  it('drains all colour for achromatopsia', () => {
    const result = simulate(rgb('#e11d48'), 'achromatopsia')
    expect(result.r).toBe(result.g)
    expect(result.g).toBe(result.b)
  })

  it('pulls red and green together for deuteranopia', () => {
    // The whole point: a palette that separates by red versus green collapses.
    const normal = distanceUnder(rgb('#e11d48'), rgb('#16a34a'), 'normal')
    const affected = distanceUnder(rgb('#e11d48'), rgb('#16a34a'), 'deuteranopia')

    expect(affected).toBeLessThan(normal / 2)
  })

  it('keeps blue and yellow apart for deuteranopia', () => {
    // Which is why a palette built on that axis survives.
    const normal = distanceUnder(rgb('#2563eb'), rgb('#facc15'), 'normal')
    const affected = distanceUnder(rgb('#2563eb'), rgb('#facc15'), 'deuteranopia')

    expect(affected).toBeGreaterThan(normal / 2)
  })

  it('preserves alpha', () => {
    expect(simulate(rgb('#3b82f680'), 'protanopia').a).toBeCloseTo(0.5, 1)
  })
})

describe('simulateAll and comparePair', () => {
  it('returns one entry per kind of vision', () => {
    const result = simulateAll('#3b82f6')
    expect(result.ok && result.value).toHaveLength(5)
  })

  it('measures the gap between two colours under each kind', () => {
    const result = comparePair('#e11d48', '#16a34a')
    if (!result.ok) throw new Error('expected the comparison to run')

    expect(result.value.normal).toBeGreaterThan(result.value.deuteranopia)
    expect(result.value.achromatopsia).toBeGreaterThanOrEqual(0)
  })

  it('reports a colour it cannot read', () => {
    expect(simulateAll('rainbow')).toEqual({ ok: false, error: 'error.invalidColor' })
  })
})
