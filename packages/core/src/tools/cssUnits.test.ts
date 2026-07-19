import { describe, expect, it } from 'vitest'
import { convertUnits, DEFAULT_CONTEXT } from './cssUnits.js'

function view(value: number, from: Parameters<typeof convertUnits>[1], context = DEFAULT_CONTEXT) {
  const result = convertUnits(value, from, context)
  if (!result.ok) throw new Error('expected the conversion to succeed')
  return Object.fromEntries(result.value.map((entry) => [entry.unit, entry.value]))
}

describe('convertUnits', () => {
  it('uses the 16px default root size', () => {
    expect(view(16, 'px')).toMatchObject({ px: 16, rem: 1, em: 1 })
    expect(view(1.5, 'rem')).toMatchObject({ px: 24 })
  })

  it('follows a changed root size', () => {
    expect(view(1, 'rem', { rootFontSize: 10, parentFontSize: 16 })).toMatchObject({ px: 10 })
  })

  it('keeps em relative to the parent, not the root', () => {
    const context = { rootFontSize: 16, parentFontSize: 20 }
    expect(view(1, 'em', context)).toMatchObject({ px: 20, rem: 1.25 })
  })

  it('converts points by the CSS definition, not the screen', () => {
    // 1pt is 1/72 inch and CSS fixes 1in at 96px, so 12pt is exactly 16px.
    expect(view(12, 'pt')).toMatchObject({ px: 16 })
  })

  it('treats percent as a share of the parent font size', () => {
    expect(view(50, 'percent', { rootFontSize: 16, parentFontSize: 20 })).toMatchObject({ px: 10 })
  })

  it('round-trips', () => {
    expect(view(view(37, 'px').rem as number, 'rem')).toMatchObject({ px: 37 })
  })

  it('rejects values that cannot be converted', () => {
    expect(convertUnits(Number.NaN, 'px')).toEqual({ ok: false, error: 'error.invalidNumber' })
    expect(convertUnits(1, 'rem', { rootFontSize: 0, parentFontSize: 16 })).toEqual({
      ok: false,
      error: 'error.invalidNumber',
    })
  })
})
