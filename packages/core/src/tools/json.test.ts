import { describe, expect, it } from 'vitest'
import { formatJson, minifyJson, sortJsonKeys } from './json.js'

describe('json', () => {
  it('formats with two-space indentation by default', () => {
    expect(formatJson('{"a":1}')).toEqual({ ok: true, value: '{\n  "a": 1\n}' })
    expect(formatJson('{"a":1}', 4)).toEqual({ ok: true, value: '{\n    "a": 1\n}' })
  })

  it('minifies', () => {
    expect(minifyJson('{\n  "a": 1\n}')).toEqual({ ok: true, value: '{"a":1}' })
  })

  it('sorts keys at every depth', () => {
    const result = sortJsonKeys('{"b":1,"a":{"d":2,"c":3}}', 0)
    expect(result).toEqual({ ok: true, value: '{"a":{"c":3,"d":2},"b":1}' })
  })

  it('leaves array order untouched while sorting the objects inside', () => {
    const result = sortJsonKeys('[{"b":1,"a":2},{"z":3}]', 0)
    expect(result).toEqual({ ok: true, value: '[{"a":2,"b":1},{"z":3}]' })
  })

  it('reports empty and malformed input', () => {
    expect(formatJson('')).toEqual({ ok: false, error: 'error.emptyInput' })
    expect(formatJson('{oops}')).toEqual({ ok: false, error: 'error.invalidJson' })
  })
})
