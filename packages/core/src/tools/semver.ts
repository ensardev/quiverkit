import { err, ok, type Result } from '../result.js'

export interface SemVer {
  major: number
  minor: number
  patch: number
  prerelease: string[]
  build: string[]
  raw: string
}

const PATTERN =
  /^v?(\d+)\.(\d+)\.(\d+)(?:-([0-9a-z-]+(?:\.[0-9a-z-]+)*))?(?:\+([0-9a-z-]+(?:\.[0-9a-z-]+)*))?$/i

export function parseSemver(input: string): Result<SemVer> {
  const trimmed = input.trim()
  if (trimmed === '') return err('error.emptyInput')

  const match = PATTERN.exec(trimmed)
  if (!match) return err('error.invalidVersion')

  const [, major, minor, patch, prerelease, build] = match

  return ok({
    major: Number(major),
    minor: Number(minor),
    patch: Number(patch),
    prerelease: prerelease ? prerelease.split('.') : [],
    build: build ? build.split('.') : [],
    raw: trimmed,
  })
}

function comparePrerelease(left: string[], right: string[]): number {
  // A version with no prerelease outranks one that has it: 1.0.0 > 1.0.0-rc.1.
  if (left.length === 0 && right.length === 0) return 0
  if (left.length === 0) return 1
  if (right.length === 0) return -1

  for (let index = 0; index < Math.max(left.length, right.length); index += 1) {
    const a = left[index]
    const b = right[index]

    if (a === undefined) return -1
    if (b === undefined) return 1
    if (a === b) continue

    const numericA = /^\d+$/.test(a)
    const numericB = /^\d+$/.test(b)

    // Numeric identifiers compare as numbers and always rank below text ones,
    // which is why 1.0.0-alpha.2 sits under 1.0.0-alpha.beta.
    if (numericA && numericB) return Number(a) - Number(b)
    if (numericA) return -1
    if (numericB) return 1

    return a < b ? -1 : 1
  }

  return 0
}

/** Negative when `left` is older, positive when newer, zero when equal. */
export function compareSemver(left: SemVer, right: SemVer): number {
  return (
    left.major - right.major ||
    left.minor - right.minor ||
    left.patch - right.patch ||
    comparePrerelease(left.prerelease, right.prerelease)
  )
}

export function sortVersions(versions: SemVer[]): SemVer[] {
  return [...versions].sort(compareSemver)
}

function bump(version: SemVer, part: 'major' | 'minor' | 'patch'): SemVer {
  const next = { ...version, prerelease: [], build: [] }
  if (part === 'major') return { ...next, major: version.major + 1, minor: 0, patch: 0, raw: '' }
  if (part === 'minor') return { ...next, minor: version.minor + 1, patch: 0, raw: '' }
  return { ...next, patch: version.patch + 1, raw: '' }
}

function within(version: SemVer, lower: SemVer, upper: SemVer): boolean {
  return compareSemver(version, lower) >= 0 && compareSemver(version, upper) < 0
}

/**
 * Handles the comparators people actually write: `^`, `~`, `>=`, `>`, `<=`,
 * `<`, `=`, `x` wildcards, `*`, space-separated AND and `||` OR. It is not the
 * whole npm range grammar — hyphen ranges are the notable omission.
 */
export function satisfies(version: SemVer, range: string): Result<boolean> {
  const trimmed = range.trim()
  if (trimmed === '') return err('error.emptyInput')

  for (const alternative of trimmed.split('||')) {
    const comparators = alternative.trim().split(/\s+/).filter(Boolean)
    if (comparators.length === 0) continue

    let matched = true
    for (const comparator of comparators) {
      const outcome = matchesComparator(version, comparator)
      if (!outcome.ok) return outcome
      if (!outcome.value) {
        matched = false
        break
      }
    }

    if (matched) return ok(true)
  }

  return ok(false)
}

function matchesComparator(version: SemVer, comparator: string): Result<boolean> {
  if (comparator === '*' || comparator === 'x' || comparator === 'latest') return ok(true)

  const operator = /^(>=|<=|>|<|=|\^|~)?(.*)$/.exec(comparator)
  if (!operator) return err('error.invalidRange')

  const [, symbol, rest = ''] = operator

  // "1.2.x" and "1.x" mean "anything inside that prefix".
  if (/[x*]/i.test(rest)) {
    const [major = '0', minor] = rest.replace(/^v/, '').split('.')
    if (/[x*]/i.test(major)) return ok(true)

    const lower = parseSemver(`${major}.${/[x*]/i.test(minor ?? 'x') ? 0 : minor}.0`)
    if (!lower.ok) return err('error.invalidRange')

    const upper = bump(lower.value, /[x*]/i.test(minor ?? 'x') ? 'major' : 'minor')
    return ok(within(version, lower.value, upper))
  }

  const target = parseSemver(rest)
  if (!target.ok) return err('error.invalidRange')

  const difference = compareSemver(version, target.value)

  switch (symbol) {
    case '>':
      return ok(difference > 0)
    case '>=':
      return ok(difference >= 0)
    case '<':
      return ok(difference < 0)
    case '<=':
      return ok(difference <= 0)
    case '^':
      // Caret keeps the leftmost non-zero digit: ^0.2.3 stops at 0.3.0.
      return ok(
        within(
          version,
          target.value,
          target.value.major !== 0
            ? bump(target.value, 'major')
            : target.value.minor !== 0
              ? bump(target.value, 'minor')
              : bump(target.value, 'patch'),
        ),
      )
    case '~':
      return ok(within(version, target.value, bump(target.value, 'minor')))
    default:
      return ok(difference === 0)
  }
}
