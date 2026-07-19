import { describe, expect, it } from 'vitest'
import { nextRuns, parseCron } from './cron.js'

function schedule(expression: string) {
  const result = parseCron(expression)
  if (!result.ok) throw new Error(`expected ${expression} to parse`)
  return result.value
}

function iso(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, '0')
  const day = [date.getFullYear(), pad(date.getMonth() + 1), pad(date.getDate())].join('-')
  return day + ' ' + pad(date.getHours()) + ':' + pad(date.getMinutes())
}

describe('parseCron', () => {
  it('expands stars, ranges, steps and lists', () => {
    expect(schedule('0 * * * *').minutes).toEqual([0])
    expect(schedule('*/15 * * * *').minutes).toEqual([0, 15, 30, 45])
    expect(schedule('0 9-12 * * *').hours).toEqual([9, 10, 11, 12])
    expect(schedule('0 0 1,15 * *').daysOfMonth).toEqual([1, 15])
  })

  it('understands month and day names', () => {
    expect(schedule('0 0 * jan *').months).toEqual([1])
    expect(schedule('0 0 * * mon-fri').daysOfWeek).toEqual([1, 2, 3, 4, 5])
  })

  it('treats 7 as Sunday, the way crontab does', () => {
    expect(schedule('0 0 * * 7').daysOfWeek).toEqual([0])
  })

  it('expands the @ shorthands', () => {
    expect(schedule('@daily')).toMatchObject({ minutes: [0], hours: [0] })
    expect(schedule('@weekly').daysOfWeek).toEqual([0])
  })

  it('rejects malformed expressions', () => {
    expect(parseCron('0 0 * *')).toEqual({ ok: false, error: 'error.invalidCron' })
    expect(parseCron('99 * * * *')).toEqual({ ok: false, error: 'error.invalidCron' })
    expect(parseCron('0 0 * * xyz')).toEqual({ ok: false, error: 'error.invalidCron' })
    expect(parseCron('')).toEqual({ ok: false, error: 'error.emptyInput' })
  })
})

describe('nextRuns', () => {
  const from = new Date(2026, 6, 19, 10, 30) // Sunday 19 July 2026, 10:30

  it('lists the next few times in order', () => {
    const runs = nextRuns(schedule('0 * * * *'), from, 3)
    expect(runs.map(iso)).toEqual(['2026-07-19 11:00', '2026-07-19 12:00', '2026-07-19 13:00'])
  })

  it('skips ahead to the next matching day', () => {
    const runs = nextRuns(schedule('30 9 * * mon'), from, 2)
    expect(runs.map(iso)).toEqual(['2026-07-20 09:30', '2026-07-27 09:30'])
  })

  it('never returns a time at or before the starting point', () => {
    for (const run of nextRuns(schedule('*/5 * * * *'), from, 5)) {
      expect(run.getTime()).toBeGreaterThan(from.getTime())
    }
  })

  it('runs on either the date or the weekday when both are restricted', () => {
    // This is cron's documented quirk: "13th OR Friday", not "Friday the 13th".
    const runs = nextRuns(schedule('0 0 13 * fri'), new Date(2026, 10, 1), 3)
    expect(runs.map(iso)).toEqual(['2026-11-06 00:00', '2026-11-13 00:00', '2026-11-20 00:00'])
  })

  it('returns nothing rather than hanging on a date that never comes', () => {
    expect(nextRuns(schedule('0 0 30 feb *'), from, 3)).toEqual([])
  })
})
