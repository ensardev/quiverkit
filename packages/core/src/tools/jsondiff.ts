import { err, ok, type Result } from '../result.js'

export interface JsonDiffEntry {
  /** JSONPath-ish key, e.g. `.users[0].name`. */
  path: string
  kind: 'added' | 'removed' | 'changed'
  /** The value on the left (absent for `added`). */
  left?: unknown
  /** The value on the right (absent for `removed`). */
  right?: unknown
}

/**
 * Compares two JSON blobs structurally.  Objects are compared key by key, arrays
 * are compared position by position.  Primitives are compared with ===.
 */
export function diffJson(leftJson: string, rightJson: string): Result<JsonDiffEntry[]> {
  const left = parse(leftJson)
  if (!left.ok) return left
  const right = parse(rightJson)
  if (!right.ok) return right

  const diffs: JsonDiffEntry[] = []
  walk('$', left.value, right.value, diffs)

  return ok(diffs)
}

function parse(input: string): Result<unknown> {
  const trimmed = input.trim()
  if (trimmed === '') return err('error.emptyInput')
  try {
    return ok(JSON.parse(trimmed))
  } catch {
    return err('error.invalidJson')
  }
}

function walk(path: string, left: unknown, right: unknown, diffs: JsonDiffEntry[]): void {
  // Same reference or both null — nothing to report.
  if (left === right) return

  const leftType = typeOf(left)
  const rightType = typeOf(right)

  if (leftType !== rightType || (leftType !== 'object' && leftType !== 'array')) {
    diffs.push({ path, kind: 'changed', left, right })
    return
  }

  if (leftType === 'array') {
    const leftArr = left as unknown[]
    const rightArr = right as unknown[]
    const max = Math.max(leftArr.length, rightArr.length)
    for (let i = 0; i < max; i++) {
      const childPath = `${path}[${i}]`
      if (i >= leftArr.length) {
        diffs.push({ path: childPath, kind: 'added', right: rightArr[i] })
      } else if (i >= rightArr.length) {
        diffs.push({ path: childPath, kind: 'removed', left: leftArr[i] })
      } else {
        walk(childPath, leftArr[i], rightArr[i], diffs)
      }
    }
    return
  }

  // Object
  const leftObj = left as Record<string, unknown>
  const rightObj = right as Record<string, unknown>
  const allKeys = new Set([...Object.keys(leftObj), ...Object.keys(rightObj)])

  for (const key of allKeys) {
    const childPath = `${path}.${/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key) ? key : JSON.stringify(key)}`
    if (!(key in leftObj)) {
      diffs.push({ path: childPath, kind: 'added', right: rightObj[key] })
    } else if (!(key in rightObj)) {
      diffs.push({ path: childPath, kind: 'removed', left: leftObj[key] })
    } else {
      walk(childPath, leftObj[key], rightObj[key], diffs)
    }
  }
}

function typeOf(value: unknown): string {
  if (value === null) return 'null'
  if (Array.isArray(value)) return 'array'
  return typeof value
}
