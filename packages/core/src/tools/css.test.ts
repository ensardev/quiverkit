import { describe, expect, it } from 'vitest'
import { elevation, gradientToCss, shadowToCss } from './css.js'

describe('gradientToCss', () => {
  const stops = [
    { color: '#ff0000', position: 100 },
    { color: '#0000ff', position: 0 },
  ]

  it('sorts the stops by position rather than by input order', () => {
    expect(gradientToCss({ kind: 'linear', angle: 90, stops })).toBe(
      'linear-gradient(90deg, #0000ff 0%, #ff0000 100%)',
    )
  })

  it('writes each gradient kind with its own syntax', () => {
    expect(gradientToCss({ kind: 'radial', angle: 0, stops })).toContain('radial-gradient(circle,')
    expect(gradientToCss({ kind: 'conic', angle: 45, stops })).toContain('conic-gradient(from 45deg,')
  })
})

describe('shadowToCss', () => {
  it('writes none for an empty stack', () => {
    expect(shadowToCss([])).toBe('none')
  })

  it('writes offsets, blur, spread and colour in CSS order', () => {
    expect(
      shadowToCss([{ offsetX: 0, offsetY: 4, blur: 8, spread: -2, color: 'black', inset: false }]),
    ).toBe('0px 4px 8px -2px black')
  })

  it('puts inset first and joins a stack with commas', () => {
    const css = shadowToCss([
      { offsetX: 0, offsetY: 1, blur: 2, spread: 0, color: 'red', inset: true },
      { offsetX: 0, offsetY: 2, blur: 4, spread: 0, color: 'blue', inset: false },
    ])

    expect(css.startsWith('inset ')).toBe(true)
    expect(css.split(', ')).toHaveLength(2)
  })
})

describe('elevation', () => {
  it('returns one layer per level, within bounds', () => {
    expect(elevation(3)).toHaveLength(3)
    expect(elevation(0)).toHaveLength(1)
    expect(elevation(99)).toHaveLength(5)
  })

  it('grows the offset and fades each layer', () => {
    const layers = elevation(3)
    expect(layers[1]?.offsetY).toBeGreaterThan(layers[0]?.offsetY ?? 0)
    expect(shadowToCss(layers).split(', ')).toHaveLength(3)
  })
})
