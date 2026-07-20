import { describe, expect, it } from 'vitest'
import { formatGraphql, minifyGraphql } from './graphql.js'

describe('formatGraphql', () => {
  it('indents a query', () => {
    const result = formatGraphql('{ user { name email } }')
    expect(result.ok).toBe(true)
    expect(result.ok && result.value).toContain('\n')
    expect(result.ok && result.value).toContain('name')
  })

  it('handles arguments', () => {
    const result = formatGraphql('{ user(id:1) { name } }')
    expect(result.ok).toBe(true)
    expect(result.ok && result.value).toContain('(id: 1)')
  })

  it('returns empty input error', () => {
    expect(formatGraphql('')).toEqual({ ok: false, error: 'error.emptyInput' })
  })

  it('preserves block strings', () => {
    const result = formatGraphql('{ echo(text: """hello\nworld""") }')
    expect(result.ok).toBe(true)
    expect(result.ok && result.value).toContain('"""hello\nworld"""')
  })

  it('handles inline fragments', () => {
    const result = formatGraphql('{ node { ... on User { name } } }')
    expect(result.ok).toBe(true)
    expect(result.ok && result.value).toContain('...')
  })
})

describe('minifyGraphql', () => {
  it('removes whitespace', () => {
    const result = minifyGraphql('{\n  user {\n    name\n  }\n}')
    expect(result.ok).toBe(true)
    expect(result.ok && result.value).toBe('{user{name}}')
  })

  it('returns empty input error', () => {
    expect(minifyGraphql('')).toEqual({ ok: false, error: 'error.emptyInput' })
  })
})
