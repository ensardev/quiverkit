import { err, ok, type Result } from '../result.js'

export interface CsvOptions {
  delimiter: string
  hasHeader: boolean
}

export const DEFAULT_CSV: CsvOptions = { delimiter: ',', hasHeader: true }

export interface CsvTable {
  headers: string[]
  rows: string[][]
}

/**
 * A hand-rolled reader rather than `split(',')`, because a quoted field may
 * contain the delimiter, a newline, or an escaped quote written as two quotes.
 * Splitting naively corrupts exactly the files people bring here for help.
 */
function readRows(text: string, delimiter: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let quoted = false

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index] as string

    if (quoted) {
      if (character === '"') {
        if (text[index + 1] === '"') {
          field += '"'
          index += 1
        } else quoted = false
      } else field += character
      continue
    }

    if (character === '"') {
      quoted = true
      continue
    }

    if (character === delimiter) {
      row.push(field)
      field = ''
      continue
    }

    if (character === '\n' || character === '\r') {
      if (character === '\r' && text[index + 1] === '\n') index += 1
      row.push(field)
      rows.push(row)
      row = []
      field = ''
      continue
    }

    field += character
  }

  if (field !== '' || row.length > 0) {
    row.push(field)
    rows.push(row)
  }

  return rows.filter((entry) => entry.length > 1 || entry[0] !== '')
}

export function parseCsv(text: string, options: CsvOptions = DEFAULT_CSV): Result<CsvTable> {
  if (text.trim() === '') return err('error.emptyInput')

  const rows = readRows(text, options.delimiter)
  if (rows.length === 0) return err('error.invalidCsv')

  if (!options.hasHeader) {
    const width = rows[0]?.length ?? 0
    return ok({
      headers: Array.from({ length: width }, (_, index) => `column${index + 1}`),
      rows,
    })
  }

  const [headers = [], ...body] = rows
  return ok({ headers, rows: body })
}

/** Numbers and booleans become real JSON values; everything else stays a string. */
function coerce(value: string): string | number | boolean | null {
  const trimmed = value.trim()
  if (trimmed === '') return null
  if (trimmed === 'true') return true
  if (trimmed === 'false') return false
  if (/^-?\d+(\.\d+)?$/.test(trimmed) && Number.isFinite(Number(trimmed))) return Number(trimmed)
  return value
}

export function csvToJson(
  text: string,
  options: CsvOptions = DEFAULT_CSV,
  indent = 2,
): Result<string> {
  const table = parseCsv(text, options)
  if (!table.ok) return table

  const objects = table.value.rows.map((row) =>
    Object.fromEntries(table.value.headers.map((header, index) => [header, coerce(row[index] ?? '')])),
  )

  return ok(JSON.stringify(objects, null, indent))
}

function quoteField(value: string, delimiter: string): string {
  return /["\n\r]/.test(value) || value.includes(delimiter)
    ? `"${value.replaceAll('"', '""')}"`
    : value
}

export function jsonToCsv(json: string, options: CsvOptions = DEFAULT_CSV): Result<string> {
  if (json.trim() === '') return err('error.emptyInput')

  let parsed: unknown
  try {
    parsed = JSON.parse(json)
  } catch {
    return err('error.invalidJson')
  }

  if (!Array.isArray(parsed)) return err('error.invalidCsv')
  if (parsed.length === 0) return ok('')

  // The header is the union of every object's keys, so a row missing a field
  // still lines up with the rest instead of shifting the columns.
  const headers: string[] = []
  for (const entry of parsed) {
    if (typeof entry !== 'object' || entry === null) return err('error.invalidCsv')
    for (const key of Object.keys(entry)) if (!headers.includes(key)) headers.push(key)
  }

  const lines = [headers.map((header) => quoteField(header, options.delimiter)).join(options.delimiter)]

  for (const entry of parsed as Record<string, unknown>[]) {
    lines.push(
      headers
        .map((header) => {
          const value = entry[header]
          if (value === undefined || value === null) return ''
          return quoteField(typeof value === 'object' ? JSON.stringify(value) : String(value), options.delimiter)
        })
        .join(options.delimiter),
    )
  }

  return ok(lines.join('\n'))
}
