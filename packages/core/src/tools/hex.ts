import { err, ok, type Result } from '../result.js'

export function textToHex(text: string, separator = ' '): Result<string> {
  if (text === '') return err('error.emptyInput')

  return ok(
    Array.from(new TextEncoder().encode(text), (byte) => byte.toString(16).padStart(2, '0')).join(
      separator,
    ),
  )
}

export function hexToText(hex: string): Result<string> {
  // Accepts "48 65 6c", "48:65:6c", "0x48 0x65" and plain "48656c" alike.
  const cleaned = hex.trim().toLowerCase().replaceAll('0x', '').replace(/[^0-9a-f]/g, '')
  if (cleaned === '') return err('error.emptyInput')
  if (cleaned.length % 2 !== 0) return err('error.invalidHex')

  const bytes = new Uint8Array(cleaned.length / 2)
  for (let index = 0; index < bytes.length; index += 1) {
    bytes[index] = Number.parseInt(cleaned.slice(index * 2, index * 2 + 2), 16)
  }

  try {
    return ok(new TextDecoder('utf-8', { fatal: true }).decode(bytes))
  } catch {
    return err('error.invalidUtf8')
  }
}

export interface DumpRow {
  offset: number
  bytes: number[]
  text: string
}

const ROW_WIDTH = 16

/**
 * The classic three-column hex dump. Bytes outside printable ASCII show as a
 * dot in the text column, which is what makes structure visible: file headers,
 * padding and embedded strings all stand out at a glance.
 */
export function hexDump(buffer: ArrayBuffer): DumpRow[] {
  const bytes = new Uint8Array(buffer)
  const rows: DumpRow[] = []

  for (let offset = 0; offset < bytes.length; offset += ROW_WIDTH) {
    const slice = [...bytes.slice(offset, offset + ROW_WIDTH)]

    rows.push({
      offset,
      bytes: slice,
      text: slice.map((byte) => (byte >= 0x20 && byte <= 0x7e ? String.fromCharCode(byte) : '.')).join(''),
    })
  }

  return rows
}

export function formatDumpRow(row: DumpRow): string {
  const offset = row.offset.toString(16).padStart(8, '0')
  const hex = row.bytes
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join(' ')
    .padEnd(ROW_WIDTH * 3 - 1, ' ')

  return `${offset}  ${hex}  |${row.text}|`
}
