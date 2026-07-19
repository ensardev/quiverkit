import { err, ok, type Result } from '../result.js'

/** A short, curated list beats dumping all 400-odd IANA zones on the user. */
export const COMMON_ZONES = [
  'UTC',
  'Europe/Istanbul',
  'Europe/London',
  'Europe/Berlin',
  'Europe/Madrid',
  'America/New_York',
  'America/Chicago',
  'America/Los_Angeles',
  'America/Sao_Paulo',
  'Asia/Dubai',
  'Asia/Kolkata',
  'Asia/Shanghai',
  'Asia/Tokyo',
  'Australia/Sydney',
]

export interface ZoneReading {
  zone: string
  /** Formatted for display by the caller's locale. */
  parts: Intl.DateTimeFormatPart[]
  /** Minutes ahead of UTC, which is what makes a meeting planner work. */
  offsetMinutes: number
}

function offsetOf(date: Date, zone: string): number {
  // Formatting the same instant in the zone and in UTC and subtracting is the
  // only way to get an offset without hard-coding a table that goes stale
  // whenever a country changes its daylight saving rules.
  const inZone = new Date(date.toLocaleString('en-US', { timeZone: zone }))
  const inUtc = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }))
  return Math.round((inZone.getTime() - inUtc.getTime()) / 60000)
}

export function readInZones(date: Date, zones: string[]): Result<ZoneReading[]> {
  if (Number.isNaN(date.getTime())) return err('error.invalidTimestamp')

  try {
    return ok(
      zones.map((zone) => ({
        zone,
        parts: new Intl.DateTimeFormat('en-GB', {
          timeZone: zone,
          dateStyle: 'medium',
          timeStyle: 'short',
        }).formatToParts(date),
        offsetMinutes: offsetOf(date, zone),
      })),
    )
  } catch {
    return err('error.invalidTimestamp')
  }
}

/** Adds whole months, clamping the day to the length of the target month. */
function addMonths(date: Date, count: number): Date {
  const target = new Date(date)
  target.setDate(1)
  target.setMonth(target.getMonth() + count)

  const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate()
  target.setDate(Math.min(date.getDate(), lastDay))
  target.setHours(date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds())

  return target
}

export interface DateDifference {
  totalDays: number
  totalHours: number
  totalMinutes: number
  years: number
  months: number
  days: number
  /** Monday to Friday only, the number people actually want for deadlines. */
  workingDays: number
}

export function dateDifference(from: Date, to: Date): Result<DateDifference> {
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
    return err('error.invalidTimestamp')
  }

  const [start, end] = from <= to ? [from, to] : [to, from]
  const milliseconds = end.getTime() - start.getTime()

  // Counting whole months by stepping forward avoids the borrow arithmetic that
  // gets 31 January to 1 March wrong. `addMonths` clamps rather than overflowing:
  // plain `setMonth` turns 31 January into 3 March, because 31 February spills
  // over into the next month.
  let elapsedMonths = 0
  let anchor = start

  for (;;) {
    const candidate = addMonths(start, elapsedMonths + 1)
    if (candidate > end) break
    anchor = candidate
    elapsedMonths += 1
  }

  const years = Math.floor(elapsedMonths / 12)
  const months = elapsedMonths % 12
  const days = Math.floor((end.getTime() - anchor.getTime()) / 86_400_000)

  let workingDays = 0
  const cursor = new Date(start)
  cursor.setHours(0, 0, 0, 0)
  const limit = new Date(end)
  limit.setHours(0, 0, 0, 0)

  while (cursor < limit) {
    const day = cursor.getDay()
    if (day !== 0 && day !== 6) workingDays += 1
    cursor.setDate(cursor.getDate() + 1)
  }

  return ok({
    totalDays: Math.floor(milliseconds / 86_400_000),
    totalHours: Math.floor(milliseconds / 3_600_000),
    totalMinutes: Math.floor(milliseconds / 60_000),
    years,
    months,
    days,
    workingDays,
  })
}
