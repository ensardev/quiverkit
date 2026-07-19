import { describe, expect, it } from 'vitest'
import { queryJson } from './jsonpath.js'

const DATA = JSON.stringify({
  store: {
    books: [
      { title: 'First', price: 10, tags: ['a', 'b'] },
      { title: 'Second', price: 20, tags: ['c'] },
      { title: 'Third', price: 30, tags: [] },
    ],
    owner: { name: 'Ada' },
  },
})

function values(path: string) {
  const result = queryJson(DATA, path)
  if (!result.ok) throw new Error(`expected ${path} to run, got ${result.error}`)
  return result.value.map((match) => match.value)
}

describe('queryJson', () => {
  it('walks plain keys', () => {
    expect(values('$.store.owner.name')).toEqual(['Ada'])
    expect(values('store.owner.name')).toEqual(['Ada'])
  })

  it('reads an index, including from the end', () => {
    expect(values('$.store.books[0].title')).toEqual(['First'])
    expect(values('$.store.books[-1].title')).toEqual(['Third'])
  })

  it('expands a wildcard', () => {
    expect(values('$.store.books[*].price')).toEqual([10, 20, 30])
  })

  it('takes a slice', () => {
    expect(values('$.store.books[0:2].title')).toEqual(['First', 'Second'])
  })

  it('finds a key at any depth', () => {
    expect(values('$..title')).toEqual(['First', 'Second', 'Third'])
    expect(values('$..name')).toEqual(['Ada'])
  })

  it('reports where each match came from', () => {
    const result = queryJson(DATA, '$.store.books[1].title')
    expect(result.ok && result.value[0]?.path).toBe('$.store.books[1].title')
  })

  it('returns nothing for a path that matches nothing', () => {
    expect(values('$.store.missing')).toEqual([])
  })

  it('reports a path it cannot read', () => {
    expect(queryJson(DATA, '$.store[')).toEqual({ ok: false, error: 'error.invalidPath' })
  })
})
