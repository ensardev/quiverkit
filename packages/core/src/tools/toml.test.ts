import { describe, expect, it } from 'vitest'
import { jsonToToml, tomlToJson } from './toml.js'

describe('tomlToJson', () => {
  it('converts a simple key-value', () => {
    const result = tomlToJson('name = "QuiverKit"')
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(JSON.parse(result.value)).toEqual({ name: 'QuiverKit' })
    }
  })

  it('respects custom indent', () => {
    expect(tomlToJson('a = "b"', 4)).toEqual({
      ok: true,
      value: '{\n    "a": "b"\n}',
    })
  })

  it('converts tables', () => {
    const toml = '[owner]\nname = "Alice"\n[database]\nport = 5432'
    const result = tomlToJson(toml)
    expect(result.ok).toBe(true)
  })

  it('converts array of tables', () => {
    const toml = '[[products]]\nname = "Hammer"\n[[products]]\nname = "Nail"'
    const result = tomlToJson(toml)
    expect(result.ok).toBe(true)
    if (result.ok) {
      const parsed = JSON.parse(result.value)
      expect(parsed.products).toHaveLength(2)
    }
  })

  it('returns empty input error', () => {
    expect(tomlToJson('')).toEqual({ ok: false, error: 'error.emptyInput' })
  })

  it('returns invalid TOML error', () => {
    const result = tomlToJson('= invalid')
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toBe('error.invalidToml')
  })
})

describe('jsonToToml', () => {
  it('converts JSON to TOML', () => {
    const result = jsonToToml('{"name":"QuiverKit","version":1}')
    expect(result.ok).toBe(true)
    expect(result.ok && result.value).toContain('name = "QuiverKit"')
  })

  it('returns invalid JSON error', () => {
    expect(jsonToToml('{broken')).toEqual({ ok: false, error: 'error.invalidJson' })
  })

  it('returns empty input error', () => {
    expect(jsonToToml('')).toEqual({ ok: false, error: 'error.emptyInput' })
  })

  it('handles nested objects as TOML tables', () => {
    const result = jsonToToml('{"database":{"host":"localhost","port":5432}}')
    expect(result.ok).toBe(true)
    expect(result.ok && result.value).toContain('[database]')
  })
})
