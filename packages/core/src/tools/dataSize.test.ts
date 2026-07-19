import { describe, expect, it } from 'vitest'
import { fromBytes, humanBytes, toBytes } from './dataSize.js'

describe('toBytes', () => {
  it('separates the decimal and binary families', () => {
    expect(toBytes(1, 'kB')).toEqual({ ok: true, value: 1000 })
    expect(toBytes(1, 'KiB')).toEqual({ ok: true, value: 1024 })
    expect(toBytes(1, 'GB')).toEqual({ ok: true, value: 1_000_000_000 })
    expect(toBytes(1, 'GiB')).toEqual({ ok: true, value: 1_073_741_824 })
  })

  it('rejects values that are not numbers', () => {
    expect(toBytes(Number.NaN, 'kB')).toEqual({ ok: false, error: 'error.invalidNumber' })
  })
})

describe('fromBytes', () => {
  it('explains why a 1 TB disk shows up as 931 GiB', () => {
    const { binary } = fromBytes(1_000_000_000_000)
    const gibibytes = binary.find((entry) => entry.unit === 'GiB')
    expect(gibibytes?.value).toBeCloseTo(931.32, 1)
  })

  it('lists every unit in both families', () => {
    const { decimal, binary } = fromBytes(2048)
    expect(decimal.find((entry) => entry.unit === 'kB')?.value).toBe(2.048)
    expect(binary.find((entry) => entry.unit === 'KiB')?.value).toBe(2)
  })
})

describe('humanBytes', () => {
  it('picks the unit a file manager would show', () => {
    expect(humanBytes(999)).toEqual({ unit: 'B', value: 999 })
    expect(humanBytes(1500)).toEqual({ unit: 'kB', value: 1.5 })
    expect(humanBytes(1536, true)).toEqual({ unit: 'KiB', value: 1.5 })
  })

  it('stops at the largest unit it knows', () => {
    expect(humanBytes(10 ** 20).unit).toBe('PB')
  })

  it('handles zero and negatives', () => {
    expect(humanBytes(0)).toEqual({ unit: 'B', value: 0 })
    expect(humanBytes(-2000)).toEqual({ unit: 'kB', value: -2 })
  })
})
