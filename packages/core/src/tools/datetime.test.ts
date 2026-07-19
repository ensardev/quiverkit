import { describe, expect, it } from 'vitest'
import { dateDifference, readInZones } from './datetime.js'

function difference(from: string, to: string) {
  const result = dateDifference(new Date(from), new Date(to))
  if (!result.ok) throw new Error('expected the difference to compute')
  return result.value
}

describe('readInZones', () => {
  it('reports each zone with its offset from UTC', () => {
    const result = readInZones(new Date('2026-07-19T12:00:00Z'), ['UTC', 'Asia/Tokyo'])
    if (!result.ok) throw new Error('expected the zones to resolve')

    expect(result.value[0]?.offsetMinutes).toBe(0)
    expect(result.value[1]?.offsetMinutes).toBe(540)
  })

  it('follows daylight saving rather than using a fixed table', () => {
    const winter = readInZones(new Date('2026-01-15T12:00:00Z'), ['Europe/London'])
    const summer = readInZones(new Date('2026-07-15T12:00:00Z'), ['Europe/London'])

    expect(winter.ok && winter.value[0]?.offsetMinutes).toBe(0)
    expect(summer.ok && summer.value[0]?.offsetMinutes).toBe(60)
  })

  it('rejects an unknown zone instead of throwing', () => {
    expect(readInZones(new Date(), ['Mars/Olympus'])).toEqual({
      ok: false,
      error: 'error.invalidTimestamp',
    })
  })
})

describe('dateDifference', () => {
  it('gives the total in days, hours and minutes', () => {
    expect(difference('2026-01-01', '2026-01-11')).toMatchObject({
      totalDays: 10,
      totalHours: 240,
    })
  })

  it('breaks the gap into years, months and days', () => {
    expect(difference('2024-03-15', '2026-07-19')).toMatchObject({
      years: 2,
      months: 4,
      days: 4,
    })
  })

  it('borrows from the correct month length', () => {
    // 31 January to 1 March 2026 is one month and one day, not zero months.
    expect(difference('2026-01-31', '2026-03-01')).toMatchObject({ months: 1, days: 1 })
  })

  it('counts working days without weekends', () => {
    // Monday 13 July to Monday 20 July 2026 spans five working days.
    expect(difference('2026-07-13', '2026-07-20').workingDays).toBe(5)
  })

  it('does not care which date comes first', () => {
    expect(difference('2026-07-19', '2026-01-01').totalDays).toBe(
      difference('2026-01-01', '2026-07-19').totalDays,
    )
  })

  it('rejects an unparseable date', () => {
    expect(dateDifference(new Date('nope'), new Date())).toEqual({
      ok: false,
      error: 'error.invalidTimestamp',
    })
  })
})
