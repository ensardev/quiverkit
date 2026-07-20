import { describe, expect, it } from 'vitest'
import { diffJson } from './jsondiff.js'

describe('diffJson', () => {
  it('finds added keys', () => {
    const result = diffJson('{"a":1}', '{"a":1,"b":2}')
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.value).toHaveLength(1)
      expect(result.value[0]).toMatchObject({ path: '$.b', kind: 'added', right: 2 })
    }
  })

  it('finds removed keys', () => {
    const result = diffJson('{"a":1,"b":2}', '{"a":1}')
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.value[0]).toMatchObject({ path: '$.b', kind: 'removed', left: 2 })
    }
  })

  it('finds changed values', () => {
    const result = diffJson('{"a":1}', '{"a":2}')
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.value[0]).toMatchObject({ path: '$.a', kind: 'changed', left: 1, right: 2 })
    }
  })

  it('finds array differences', () => {
    const result = diffJson('{"items":[1,2]}', '{"items":[1,3]}')
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.value.some((d) => d.path === '$.items[1]')).toBe(true)
    }
  })

  it('returns empty for identical documents', () => {
    const result = diffJson('{"a":1}', '{"a":1}')
    expect(result.ok).toBe(true)
    expect(result.ok && result.value).toHaveLength(0)
  })

  it('returns error for invalid JSON', () => {
    expect(diffJson('{broken', '{}')).toEqual({ ok: false, error: 'error.invalidJson' })
    expect(diffJson('{}', '{broken')).toEqual({ ok: false, error: 'error.invalidJson' })
  })

  it('returns error for empty input', () => {
    expect(diffJson('', '{}')).toEqual({ ok: false, error: 'error.emptyInput' })
  })

  it('handles deeply nested diffs', () => {
    const result = diffJson(
      '{"a":{"b":{"c":1}}}',
      '{"a":{"b":{"c":2}}}',
    )
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.value[0]).toMatchObject({ path: '$.a.b.c', kind: 'changed' })
    }
  })
})
