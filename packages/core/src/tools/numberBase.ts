import { err, ok, type Result } from '../result.js'

const DIGITS = '0123456789abcdefghijklmnopqrstuvwxyz'

export const MIN_BASE = 2
export const MAX_BASE = 36

/** The bases worth a one-click button; any value in 2–36 still works. */
export const COMMON_BASES = [2, 8, 10, 16] as const

/**
 * Parsing runs on BigInt rather than `Number.parseInt`, which silently loses
 * precision above 2^53 — exactly the range where people convert hashes, ids and
 * bit masks, so the wrong answer would look plausible.
 */
export function parseInBase(value: string, base: number): Result<bigint> {
  if (base < MIN_BASE || base > MAX_BASE || !Number.isInteger(base)) return err('error.invalidBase')

  const trimmed = value.trim().toLowerCase().replaceAll('_', '')
  if (trimmed === '') return err('error.emptyInput')

  const negative = trimmed.startsWith('-')
  const digits = negative ? trimmed.slice(1) : trimmed
  if (digits === '') return err('error.invalidNumber')

  let result = 0n
  for (const character of digits) {
    const digit = DIGITS.indexOf(character)
    if (digit < 0 || digit >= base) return err('error.invalidNumber')
    result = result * BigInt(base) + BigInt(digit)
  }

  return ok(negative ? -result : result)
}

export function formatInBase(value: bigint, base: number): string {
  return value.toString(base)
}

export function convertBase(value: string, from: number, to: number): Result<string> {
  if (to < MIN_BASE || to > MAX_BASE || !Number.isInteger(to)) return err('error.invalidBase')

  const parsed = parseInBase(value, from)
  return parsed.ok ? ok(formatInBase(parsed.value, to)) : parsed
}

export interface BaseView {
  base: number
  value: string
}

export function toCommonBases(value: string, from: number): Result<BaseView[]> {
  const parsed = parseInBase(value, from)
  if (!parsed.ok) return parsed

  return ok(COMMON_BASES.map((base) => ({ base, value: formatInBase(parsed.value, base) })))
}
