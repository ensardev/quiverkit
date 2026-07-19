import { describe, expect, it } from 'vitest'
import { generateMockData } from './mock.js'

function rows(seed: number, count = 3) {
  const result = generateMockData({
    fields: [
      { name: 'id', type: 'uuid' },
      { name: 'name', type: 'fullName' },
      { name: 'email', type: 'email' },
      { name: 'age', type: 'integer' },
    ],
    count,
    seed,
  })

  if (!result.ok) throw new Error('expected the mock data to build')
  return JSON.parse(result.value) as Record<string, unknown>[]
}

describe('generateMockData', () => {
  it('produces the requested number of rows with the requested fields', () => {
    const data = rows(1, 5)
    expect(data).toHaveLength(5)
    expect(Object.keys(data[0] ?? {})).toEqual(['id', 'name', 'email', 'age'])
  })

  it('repeats exactly for the same seed and differs for another', () => {
    // A fixture that changes on every run is worse than no fixture at all.
    expect(rows(42)).toEqual(rows(42))
    expect(rows(42)).not.toEqual(rows(43))
  })

  it('builds an email that matches its own name field', () => {
    for (const row of rows(7)) {
      const [first = ''] = String(row.name).toLowerCase().split(' ')
      expect(String(row.email)).toContain(first.replace(/[^a-z]/g, ''))
    }
  })

  it('refuses to generate without any fields', () => {
    expect(generateMockData({ fields: [], count: 3, seed: 1 })).toEqual({
      ok: false,
      error: 'error.emptyInput',
    })
  })

  it('caps an absurd row count', () => {
    const result = generateMockData({
      fields: [{ name: 'id', type: 'id' }],
      count: 100_000,
      seed: 1,
    })

    expect(result.ok && (JSON.parse(result.value) as unknown[]).length).toBeLessThanOrEqual(500)
  })
})
