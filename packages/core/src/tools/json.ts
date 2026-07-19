import { err, ok, type Result } from '../result.js'

function parse(input: string): Result<unknown> {
  if (input.trim() === '') return err('error.emptyInput')

  try {
    return ok(JSON.parse(input) as unknown)
  } catch {
    return err('error.invalidJson')
  }
}

export function formatJson(input: string, indent = 2): Result<string> {
  const parsed = parse(input)
  return parsed.ok ? ok(JSON.stringify(parsed.value, null, indent)) : parsed
}

export function minifyJson(input: string): Result<string> {
  const parsed = parse(input)
  return parsed.ok ? ok(JSON.stringify(parsed.value)) : parsed
}

/** Sorts object keys recursively, which makes two JSON blobs comparable. */
export function sortJsonKeys(input: string, indent = 2): Result<string> {
  const parsed = parse(input)
  if (!parsed.ok) return parsed

  const sort = (value: unknown): unknown => {
    if (Array.isArray(value)) return value.map(sort)
    if (value === null || typeof value !== 'object') return value

    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, nested]) => [key, sort(nested)]),
    )
  }

  return ok(JSON.stringify(sort(parsed.value), null, indent))
}
