import { describe, expect, it } from 'vitest'
import { jsonToYaml, yamlToJson } from './yaml.js'

describe('yamlToJson', () => {
  it('converts a simple mapping', () => {
    const result = yamlToJson('name: QuiverKit\nversion: 1')
    expect(result.ok).toBe(true)
    if (result.ok) {
      const parsed = JSON.parse(result.value)
      expect(parsed).toEqual({ name: 'QuiverKit', version: 1 })
    }
  })

  it('respects custom indent', () => {
    expect(yamlToJson('a: b', 4)).toEqual({
      ok: true,
      value: '{\n    "a": "b"\n}',
    })
  })

  it('returns empty input error', () => {
    expect(yamlToJson('')).toEqual({ ok: false, error: 'error.emptyInput' })
  })

  it('returns invalid YAML error', () => {
    const result = yamlToJson('{invalid: yaml: here}')
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toBe('error.invalidYaml')
  })

  it('handles nested objects and arrays', () => {
    const yaml = 'items:\n  - name: a\n  - name: b\nmetadata:\n  count: 2'
    const result = yamlToJson(yaml)
    expect(result.ok).toBe(true)
    if (result.ok) {
      const parsed = JSON.parse(result.value)
      expect(parsed.items).toHaveLength(2)
      expect(parsed.metadata.count).toBe(2)
    }
  })
})

describe('jsonToYaml', () => {
  it('converts JSON to YAML', () => {
    const result = jsonToYaml('{"name":"QuiverKit","version":1}')
    expect(result.ok).toBe(true)
    expect(result.ok && result.value).toContain('name: QuiverKit')
  })

  it('returns invalid JSON error', () => {
    expect(jsonToYaml('{broken')).toEqual({ ok: false, error: 'error.invalidJson' })
  })

  it('returns empty input error', () => {
    expect(jsonToYaml('')).toEqual({ ok: false, error: 'error.emptyInput' })
  })
})

describe('round-trip', () => {
  it('YAML → JSON → YAML preserves structure', () => {
    const yaml = 'name: test\nvalues:\n  - 1\n  - 2'
    const json = yamlToJson(yaml)
    expect(json.ok).toBe(true)
    if (!json.ok) return
    const backAgain = jsonToYaml(json.value)
    expect(backAgain.ok).toBe(true)
    expect(backAgain.ok && backAgain.value).toContain('name: test')
  })
})
