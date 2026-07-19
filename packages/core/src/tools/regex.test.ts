import { describe, expect, it } from 'vitest'
import { highlightMatches, testRegex } from './regex.js'

function matches(pattern: string, flags: string, input: string) {
  const result = testRegex(pattern, flags, input)
  if (!result.ok) throw new Error(`expected ${pattern} to compile`)
  return result.value
}

describe('testRegex', () => {
  it('finds every match, not just the first', () => {
    expect(matches('\\d+', '', 'a1 b22 c333').map((match) => match.value)).toEqual([
      '1',
      '22',
      '333',
    ])
  })

  it('works whether or not the caller passes the global flag', () => {
    expect(matches('a', 'g', 'aaa')).toHaveLength(3)
    expect(matches('a', '', 'aaa')).toHaveLength(3)
  })

  it('reports capture groups with their names', () => {
    const [match] = matches('(?<year>\\d{4})-(\\d{2})', '', '2026-07')
    expect(match?.groups).toEqual([
      { name: 'year', value: '2026' },
      { name: undefined, value: '07' },
    ])
  })

  it('terminates on a pattern that can match nothing', () => {
    // Without nudging lastIndex this loops forever, which is the classic bug in
    // hand-rolled regex testers.
    expect(matches('a*', '', 'bbb').length).toBeGreaterThan(0)
  })

  it('honours flags', () => {
    expect(matches('ABC', 'i', 'abc')).toHaveLength(1)
    expect(matches('^b', 'm', 'a\nb')).toHaveLength(1)
  })

  it('reports a broken pattern instead of throwing', () => {
    expect(testRegex('(unclosed', '', 'x')).toEqual({ ok: false, error: 'error.invalidRegex' })
  })

  it('returns nothing for an empty pattern', () => {
    expect(testRegex('', '', 'abc')).toEqual({ ok: true, value: [] })
  })

  it('stops before a runaway number of matches', () => {
    expect(matches('.', '', 'x'.repeat(5000)).length).toBeLessThanOrEqual(1000)
  })
})

describe('highlightMatches', () => {
  it('splits the input into plain and matched runs', () => {
    expect(highlightMatches('a1b', matches('\\d', '', 'a1b'))).toEqual([
      { value: 'a', matched: false },
      { value: '1', matched: true },
      { value: 'b', matched: false },
    ])
  })

  it('leaves untouched input as a single run', () => {
    expect(highlightMatches('abc', [])).toEqual([{ value: 'abc', matched: false }])
  })
})
