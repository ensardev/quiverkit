import * as smolToml from 'smol-toml'
import { err, ok, type Result } from '../result.js'

/**
 * Converts TOML to formatted JSON.  The indent is two spaces by default;
 * passing 0 produces single-line output.
 */
export function tomlToJson(input: string, indent = 2): Result<string> {
  const trimmed = input.trim()
  if (trimmed === '') return err('error.emptyInput')

  let parsed: unknown
  try {
    parsed = smolToml.parse(trimmed)
  } catch {
    return err('error.invalidToml')
  }

  return ok(JSON.stringify(parsed, null, indent))
}

/** Converts JSON to TOML. */
export function jsonToToml(input: string): Result<string> {
  const trimmed = input.trim()
  if (trimmed === '') return err('error.emptyInput')

  let parsed: unknown
  try {
    parsed = JSON.parse(trimmed)
  } catch {
    return err('error.invalidJson')
  }

  return ok(smolToml.stringify(parsed as Record<string, unknown>))
}
