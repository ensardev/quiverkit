import { err, ok, type Result } from '../result.js'

export interface CronSchedule {
  minutes: number[]
  hours: number[]
  daysOfMonth: number[]
  months: number[]
  daysOfWeek: number[]
}

interface FieldRange {
  min: number
  max: number
  names?: Record<string, number>
}

const MONTH_NAMES = {
  jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
  jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
}

const DAY_NAMES = { sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6 }

const RANGES: FieldRange[] = [
  { min: 0, max: 59 },
  { min: 0, max: 23 },
  { min: 1, max: 31 },
  { min: 1, max: 12, names: MONTH_NAMES },
  { min: 0, max: 6, names: DAY_NAMES },
]

export const CRON_PRESETS: Record<string, string> = {
  '@hourly': '0 * * * *',
  '@daily': '0 0 * * *',
  '@weekly': '0 0 * * 0',
  '@monthly': '0 0 1 * *',
  '@yearly': '0 0 1 1 *',
}

// Expands one field — "1-5", "*/15", "mon,wed" — into the values it matches.
// (Written as a line comment on purpose: the step syntax contains the sequence
// that would close a block comment early.)
function expandField(raw: string, range: FieldRange): number[] | null {
  const values = new Set<number>()

  for (const part of raw.split(',')) {
    const [body = '', stepText] = part.split('/')
    const step = stepText === undefined ? 1 : Number(stepText)
    if (!Number.isInteger(step) || step < 1) return null

    let start = range.min
    let end = range.max

    if (body !== '*' && body !== '?') {
      const [fromText = '', toText] = body.split('-')
      const read = (text: string) => {
        const named = range.names?.[text.toLowerCase()]
        if (named !== undefined) return named
        return /^\d+$/.test(text) ? Number(text) : Number.NaN
      }

      start = read(fromText)
      end = toText === undefined ? start : read(toText)

      // Sunday is 0 in cron but 7 is widely accepted for the same day.
      if (range.max === 6) {
        if (start === 7) start = 0
        if (end === 7) end = 0
      }

      if (Number.isNaN(start) || Number.isNaN(end)) return null
      if (start < range.min || end > range.max || start > end) return null
    }

    for (let value = start; value <= end; value += step) values.add(value)
  }

  return [...values].sort((left, right) => left - right)
}

export function parseCron(expression: string): Result<CronSchedule> {
  const trimmed = expression.trim().toLowerCase()
  if (trimmed === '') return err('error.emptyInput')

  const normalised = CRON_PRESETS[trimmed] ?? trimmed
  const fields = normalised.split(/\s+/)
  if (fields.length !== 5) return err('error.invalidCron')

  const expanded = fields.map((field, index) => expandField(field, RANGES[index] as FieldRange))
  if (expanded.some((values) => values === null || values.length === 0)) return err('error.invalidCron')

  const [minutes, hours, daysOfMonth, months, daysOfWeek] = expanded as number[][]

  return ok({
    minutes: minutes as number[],
    hours: hours as number[],
    daysOfMonth: daysOfMonth as number[],
    months: months as number[],
    daysOfWeek: daysOfWeek as number[],
  })
}

const ALL_DAYS_OF_MONTH = 31
const ALL_DAYS_OF_WEEK = 7
const SEARCH_LIMIT_DAYS = 366 * 5

/**
 * Walks day by day rather than minute by minute. A yearly schedule would need
 * half a million minute checks; this needs a few hundred day checks and then
 * only visits the hours and minutes of the days that actually match.
 *
 * When both day-of-month and day-of-week are restricted, cron runs on *either*,
 * not both — a quirk that surprises people writing "1 * * 13 5" for Friday the
 * 13th and getting every 13th plus every Friday.
 */
export function nextRuns(schedule: CronSchedule, from: Date, count = 5): Date[] {
  const runs: Date[] = []
  const restrictsDayOfMonth = schedule.daysOfMonth.length < ALL_DAYS_OF_MONTH
  const restrictsDayOfWeek = schedule.daysOfWeek.length < ALL_DAYS_OF_WEEK

  const cursor = new Date(from)
  cursor.setSeconds(0, 0)
  cursor.setMinutes(cursor.getMinutes() + 1)

  const startOfSearch = new Date(cursor)
  startOfSearch.setHours(0, 0, 0, 0)

  for (let offset = 0; offset < SEARCH_LIMIT_DAYS && runs.length < count; offset += 1) {
    const day = new Date(startOfSearch)
    day.setDate(day.getDate() + offset)

    if (!schedule.months.includes(day.getMonth() + 1)) continue

    const matchesDate = schedule.daysOfMonth.includes(day.getDate())
    const matchesWeekday = schedule.daysOfWeek.includes(day.getDay())
    const dayMatches =
      restrictsDayOfMonth && restrictsDayOfWeek
        ? matchesDate || matchesWeekday
        : matchesDate && matchesWeekday

    if (!dayMatches) continue

    for (const hour of schedule.hours) {
      for (const minute of schedule.minutes) {
        const moment = new Date(day)
        moment.setHours(hour, minute, 0, 0)

        if (moment >= cursor) {
          runs.push(moment)
          if (runs.length >= count) return runs
        }
      }
    }
  }

  return runs
}
