import { describe, expect, it } from 'vitest'
import { convertBase, parseInBase, toCommonBases } from './numberBase.js'

describe('convertBase', () => {
  it('converts between the common bases', () => {
    expect(convertBase('255', 10, 16)).toEqual({ ok: true, value: 'ff' })
    expect(convertBase('ff', 16, 2)).toEqual({ ok: true, value: '11111111' })
    expect(convertBase('777', 8, 10)).toEqual({ ok: true, value: '511' })
  })

  it('keeps precision past the safe integer limit', () => {
    // Number.parseInt would return 9007199254740992 here and lose the last bit.
    expect(convertBase('9007199254740993', 10, 16)).toEqual({ ok: true, value: '20000000000001' })
  })

  it('handles negatives and underscores', () => {
    expect(convertBase('-255', 10, 16)).toEqual({ ok: true, value: '-ff' })
    expect(convertBase('1111_1111', 2, 10)).toEqual({ ok: true, value: '255' })
  })

  it('is case insensitive', () => {
    expect(convertBase('FF', 16, 10)).toEqual({ ok: true, value: '255' })
  })

  it('rejects digits that do not belong to the base', () => {
    expect(convertBase('129', 8, 10)).toEqual({ ok: false, error: 'error.invalidNumber' })
    expect(convertBase('2', 2, 10)).toEqual({ ok: false, error: 'error.invalidNumber' })
  })

  it('rejects impossible bases', () => {
    expect(parseInBase('1', 1)).toEqual({ ok: false, error: 'error.invalidBase' })
    expect(parseInBase('1', 37)).toEqual({ ok: false, error: 'error.invalidBase' })
    expect(convertBase('1', 10, 99)).toEqual({ ok: false, error: 'error.invalidBase' })
  })

  it('reports empty input', () => {
    expect(convertBase('   ', 10, 2)).toEqual({ ok: false, error: 'error.emptyInput' })
  })
})

describe('toCommonBases', () => {
  it('returns binary, octal, decimal and hex at once', () => {
    expect(toCommonBases('42', 10)).toEqual({
      ok: true,
      value: [
        { base: 2, value: '101010' },
        { base: 8, value: '52' },
        { base: 10, value: '42' },
        { base: 16, value: '2a' },
      ],
    })
  })
})
