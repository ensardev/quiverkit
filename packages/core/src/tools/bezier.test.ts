import { describe, expect, it } from 'vitest'
import { BEZIER_PRESETS, evaluate, sample, toCss } from './bezier.js'

describe('evaluate', () => {
  it('pins both ends of every curve', () => {
    for (const curve of Object.values(BEZIER_PRESETS)) {
      expect(evaluate(curve, 0)).toBe(0)
      expect(evaluate(curve, 1)).toBe(1)
    }
  })

  it('leaves a linear curve alone', () => {
    const linear = BEZIER_PRESETS.linear
    if (!linear) throw new Error('missing preset')

    for (const x of [0.1, 0.25, 0.5, 0.9]) {
      expect(evaluate(linear, x)).toBeCloseTo(x, 4)
    }
  })

  it('starts slowly for ease-in and quickly for ease-out', () => {
    const easeIn = BEZIER_PRESETS.easeIn
    const easeOut = BEZIER_PRESETS.easeOut
    if (!easeIn || !easeOut) throw new Error('missing preset')

    expect(evaluate(easeIn, 0.25)).toBeLessThan(0.25)
    expect(evaluate(easeOut, 0.25)).toBeGreaterThan(0.25)
  })

  it('handles control points that overshoot past 1', () => {
    const back = BEZIER_PRESETS.backOut
    if (!back) throw new Error('missing preset')

    // A "back" curve is supposed to go past its target and come back; a solver
    // that diverges here would return NaN instead.
    expect(evaluate(back, 0.6)).toBeGreaterThan(1)
    expect(Number.isNaN(evaluate(back, 0.6))).toBe(false)
  })

  it('clamps input outside 0 to 1', () => {
    const ease = BEZIER_PRESETS.ease
    if (!ease) throw new Error('missing preset')

    expect(evaluate(ease, -1)).toBe(0)
    expect(evaluate(ease, 2)).toBe(1)
  })

  it('rises monotonically for the standard easings', () => {
    const ease = BEZIER_PRESETS.easeInOut
    if (!ease) throw new Error('missing preset')

    let previous = -1
    for (let x = 0; x <= 1; x += 0.05) {
      const y = evaluate(ease, x)
      expect(y).toBeGreaterThanOrEqual(previous)
      previous = y
    }
  })
})

describe('sample and toCss', () => {
  it('returns one more point than the step count', () => {
    expect(sample(BEZIER_PRESETS.ease as never, 10)).toHaveLength(11)
  })

  it('writes the CSS function without trailing zeroes', () => {
    expect(toCss({ x1: 0.25, y1: 0.1, x2: 0.25, y2: 1 })).toBe('cubic-bezier(0.25, 0.1, 0.25, 1)')
  })
})
