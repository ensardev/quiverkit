import { describe, expect, it } from 'vitest'
import { describeTimestamp, parseTimestamp } from './timestamp.js'

function expectDate(input: string): Date {
  const result = parseTimestamp(input)
  if (!result.ok) throw new Error(`expected ${input} to parse`)
  return result.value
}

describe('timestamp', () => {
  it('reads ten digits as seconds and more as milliseconds', () => {
    expect(expectDate('1700000000').getTime()).toBe(1_700_000_000_000)
    expect(expectDate('1700000000000').getTime()).toBe(1_700_000_000_000)
  })

  it('reads iso strings', () => {
    expect(expectDate('2026-07-19T12:00:00Z').toISOString()).toBe('2026-07-19T12:00:00.000Z')
  })

  it('rejects nonsense', () => {
    expect(parseTimestamp('not a date')).toEqual({ ok: false, error: 'error.invalidTimestamp' })
    expect(parseTimestamp('')).toEqual({ ok: false, error: 'error.emptyInput' })
  })

  it('describes a moment in unix, iso and relative form', () => {
    const now = new Date('2026-07-19T12:00:00Z')
    const view = describeTimestamp(new Date('2026-07-16T12:00:00Z'), now)

    expect(view.unixSeconds).toBe(1784203200)
    expect(view.iso).toBe('2026-07-16T12:00:00.000Z')
    expect(view.relative).toEqual({ amount: -3, unit: 'day' })
  })

  it('falls back to seconds for moments under a second away', () => {
    const now = new Date('2026-07-19T12:00:00Z')
    const view = describeTimestamp(new Date('2026-07-19T12:00:00.400Z'), now)

    expect(view.relative.unit).toBe('second')
  })
})
