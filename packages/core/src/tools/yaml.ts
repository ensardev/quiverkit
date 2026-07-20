import { dump, load } from 'js-yaml'
import { err, ok, type Result } from '../result.js'

/**
 * Converts YAML to formatted JSON.  The indent is two spaces by default;
 * passing 0 produces single-line output, which is useful for piping.
 */
export function yamlToJson(input: string, indent = 2): Result<string> {
  const trimmed = input.trim()
  if (trimmed === '') return err('error.emptyInput')

  let parsed: unknown
  try {
    parsed = load(trimmed)
  } catch {
    return err('error.invalidYaml')
  }

  // yaml.load returns undefined for an empty document.
  if (parsed === undefined) return ok('')

  return ok(JSON.stringify(parsed, null, indent))
}

/** Converts JSON to YAML. */
export function jsonToYaml(input: string): Result<string> {
  const trimmed = input.trim()
  if (trimmed === '') return err('error.emptyInput')

  let parsed: unknown
  try {
    parsed = JSON.parse(trimmed)
  } catch {
    return err('error.invalidJson')
  }

  return ok(dump(parsed, { lineWidth: -1, noRefs: true }))
}
