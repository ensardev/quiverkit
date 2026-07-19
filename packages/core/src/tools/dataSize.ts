import { err, ok, type Result } from '../result.js'

/**
 * The two families exist because they disagree: a disk maker's "1 TB" is
 * 10^12 bytes, while the operating system reports 2^40. That gap is the whole
 * reason a 1 TB drive shows up as 931 GB.
 */
export const DECIMAL_UNITS = ['B', 'kB', 'MB', 'GB', 'TB', 'PB'] as const
export const BINARY_UNITS = ['B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB'] as const

export type DecimalUnit = (typeof DECIMAL_UNITS)[number]
export type BinaryUnit = (typeof BINARY_UNITS)[number]
export type SizeUnit = DecimalUnit | BinaryUnit

const FACTORS = new Map<SizeUnit, number>([
  ...DECIMAL_UNITS.map((unit, power) => [unit, 1000 ** power] as const),
  ...BINARY_UNITS.map((unit, power) => [unit, 1024 ** power] as const),
])

export function toBytes(value: number, unit: SizeUnit): Result<number> {
  if (!Number.isFinite(value)) return err('error.invalidNumber')

  const factor = FACTORS.get(unit)
  return factor === undefined ? err('error.invalidNumber') : ok(value * factor)
}

export interface SizeView {
  unit: SizeUnit
  value: number
}

export function fromBytes(bytes: number): { decimal: SizeView[]; binary: SizeView[] } {
  const convert = (units: readonly SizeUnit[]) =>
    units.map((unit) => ({ unit, value: bytes / (FACTORS.get(unit) ?? 1) }))

  return { decimal: convert(DECIMAL_UNITS), binary: convert(BINARY_UNITS) }
}

/** Picks the largest unit that keeps the number above 1, the way a file manager does. */
export function humanBytes(bytes: number, binary = false): SizeView {
  const units = binary ? BINARY_UNITS : DECIMAL_UNITS
  const step = binary ? 1024 : 1000
  const magnitude = Math.abs(bytes)

  let power = 0
  while (magnitude >= step ** (power + 1) && power < units.length - 1) power += 1

  return {
    unit: units[power] as SizeUnit,
    value: bytes / step ** power,
  }
}
