import { describe, expect, it } from 'vitest'
import { formatDumpRow, hexDump, hexToText, textToHex } from './hex.js'

describe('hex conversion', () => {
  it('round-trips text of any alphabet', () => {
    for (const sample of ['hello', 'İstanbul', 'こんにちは', '🎯']) {
      const hex = textToHex(sample)
      expect(hex.ok && hexToText(hex.value)).toEqual({ ok: true, value: sample })
    }
  })

  it('encodes utf-8 bytes, not code units', () => {
    expect(textToHex('A')).toEqual({ ok: true, value: '41' })
    expect(textToHex('é')).toEqual({ ok: true, value: 'c3 a9' })
  })

  it('accepts the separators people actually paste', () => {
    for (const input of ['48 65 6c 6c 6f', '48:65:6c:6c:6f', '0x480x650x6c0x6c0x6f', '48656c6c6f']) {
      expect(hexToText(input)).toEqual({ ok: true, value: 'Hello' })
    }
  })

  it('rejects an odd number of digits', () => {
    expect(hexToText('4')).toEqual({ ok: false, error: 'error.invalidHex' })
  })

  it('reports binary that is not text', () => {
    expect(hexToText('ff fe fd')).toEqual({ ok: false, error: 'error.invalidUtf8' })
  })
})

describe('hexDump', () => {
  const bytes = new TextEncoder().encode('Hello, QuiverKit! This is a dump.')

  it('breaks the data into rows of sixteen', () => {
    const rows = hexDump(bytes.buffer as ArrayBuffer)
    expect(rows[0]?.bytes).toHaveLength(16)
    expect(rows[0]?.offset).toBe(0)
    expect(rows[1]?.offset).toBe(16)
  })

  it('shows printable characters and replaces the rest with a dot', () => {
    const rows = hexDump(new Uint8Array([0x41, 0x00, 0x42]).buffer)
    expect(rows[0]?.text).toBe('A.B')
  })

  it('lines the columns up so the dump stays readable', () => {
    const rows = hexDump(bytes.buffer as ArrayBuffer)
    const [first, second] = rows.map(formatDumpRow)

    expect(first?.startsWith('00000000  48 65 6c 6c 6f')).toBe(true)
    expect(first?.indexOf('|')).toBe(second?.indexOf('|'))
  })

  it('returns nothing for empty input', () => {
    expect(hexDump(new ArrayBuffer(0))).toEqual([])
  })
})
