import { err, ok, type Result } from '../result.js'

/**
 * Ten digits is the boundary everyone trips over: 1_700_000_000 is a plausible
 * date in seconds but lands in 1970 when read as milliseconds. Anything longer
 * than ten digits is treated as milliseconds.
 */
const SECONDS_DIGIT_LIMIT = 10

export function parseTimestamp(input: string): Result<Date> {
  const trimmed = input.trim()
  if (trimmed === '') return err('error.emptyInput')

  if (/^-?\d+$/.test(trimmed)) {
    const digits = trimmed.replace('-', '').length
    const numeric = Number(trimmed)
    const date = new Date(digits > SECONDS_DIGIT_LIMIT ? numeric : numeric * 1000)
    return Number.isNaN(date.getTime()) ? err('error.invalidTimestamp') : ok(date)
  }

  const parsed = new Date(trimmed)
  return Number.isNaN(parsed.getTime()) ? err('error.invalidTimestamp') : ok(parsed)
}

export interface TimestampView {
  unixSeconds: number
  unixMillis: number
  iso: string
  utc: string
  relative: { amount: number; unit: Intl.RelativeTimeFormatUnit }
}

const RELATIVE_STEPS: { unit: Intl.RelativeTimeFormatUnit; ms: number }[] = [
  { unit: 'year', ms: 365 * 24 * 60 * 60 * 1000 },
  { unit: 'month', ms: 30 * 24 * 60 * 60 * 1000 },
  { unit: 'day', ms: 24 * 60 * 60 * 1000 },
  { unit: 'hour', ms: 60 * 60 * 1000 },
  { unit: 'minute', ms: 60 * 1000 },
  { unit: 'second', ms: 1000 },
]

/**
 * Returns the pieces, not a sentence. Turning "-3 days" into readable text is
 * `Intl.RelativeTimeFormat`'s job in the UI layer, where the locale is known.
 */
export function describeTimestamp(date: Date, now = new Date()): TimestampView {
  const millis = date.getTime()
  const difference = millis - now.getTime()

  const step =
    RELATIVE_STEPS.find((candidate) => Math.abs(difference) >= candidate.ms) ??
    RELATIVE_STEPS[RELATIVE_STEPS.length - 1]

  return {
    unixSeconds: Math.floor(millis / 1000),
    unixMillis: millis,
    iso: date.toISOString(),
    utc: date.toUTCString(),
    relative: {
      amount: Math.round(difference / (step?.ms ?? 1000)),
      unit: step?.unit ?? 'second',
    },
  }
}
