import { err, ok, type Result } from '../result.js'

export interface RegexGroup {
  name: string | undefined
  value: string | undefined
}

export interface RegexMatch {
  index: number
  value: string
  groups: RegexGroup[]
}

/** Guards against a pattern that matches millions of times on a large input. */
const MATCH_LIMIT = 1000

export function testRegex(pattern: string, flags: string, input: string): Result<RegexMatch[]> {
  if (pattern === '') return ok([])

  let expression: RegExp
  try {
    // The global flag is added unconditionally: without it `exec` always returns
    // the first match and the loop below would never advance.
    expression = new RegExp(pattern, flags.includes('g') ? flags : `${flags}g`)
  } catch {
    return err('error.invalidRegex')
  }

  const matches: RegexMatch[] = []
  let match: RegExpExecArray | null

  while ((match = expression.exec(input)) !== null) {
    const [value, ...captures] = match
    const names = match.groups ? Object.keys(match.groups) : []

    matches.push({
      index: match.index,
      value,
      groups: captures.map((capture, position) => ({
        name: names[position],
        value: capture,
      })),
    })

    // An empty match (`a*` against "b") leaves lastIndex where it was, so the
    // loop would spin forever. Nudging it forward is the standard remedy.
    if (match[0] === '') expression.lastIndex += 1
    if (matches.length >= MATCH_LIMIT) break
  }

  return ok(matches)
}

export interface RegexHighlight {
  value: string
  matched: boolean
}

/** Splits the input into alternating plain and matched runs, ready to render. */
export function highlightMatches(input: string, matches: RegexMatch[]): RegexHighlight[] {
  const parts: RegexHighlight[] = []
  let cursor = 0

  for (const match of matches) {
    if (match.index > cursor) {
      parts.push({ value: input.slice(cursor, match.index), matched: false })
    }
    if (match.value !== '') parts.push({ value: match.value, matched: true })
    cursor = Math.max(cursor, match.index + match.value.length)
  }

  if (cursor < input.length) parts.push({ value: input.slice(cursor), matched: false })

  return parts
}
