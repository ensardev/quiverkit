import { err, ok, type Result } from '../result.js'

export interface PathMatch {
  path: string
  value: unknown
}

interface Segment {
  kind: 'key' | 'index' | 'wildcard' | 'descend' | 'slice'
  name?: string
  index?: number
  from?: number
  to?: number
}

/**
 * A deliberately small subset of JSONPath: `$.a.b`, `a[0]`, `a[*]`, `a[1:3]`
 * and the recursive `..name`. Filter expressions are left out — they are where
 * the grammar turns into a language of its own, and almost nobody types them by
 * hand into a browser tool.
 */
function parsePath(path: string): Segment[] | null {
  const trimmed = path.trim().replace(/^\$/, '')
  const segments: Segment[] = []
  let index = 0

  while (index < trimmed.length) {
    if (trimmed.startsWith('..', index)) {
      const match = /^\.\.([A-Za-z_$][\w$]*|\*)/.exec(trimmed.slice(index))
      if (!match) return null
      segments.push(
        match[1] === '*' ? { kind: 'wildcard' } : { kind: 'descend', name: match[1] as string },
      )
      index += match[0].length
      continue
    }

    if (trimmed[index] === '.') {
      const match = /^\.([A-Za-z_$][\w$]*|\*)/.exec(trimmed.slice(index))
      if (!match) return null
      segments.push(match[1] === '*' ? { kind: 'wildcard' } : { kind: 'key', name: match[1] as string })
      index += match[0].length
      continue
    }

    if (trimmed[index] === '[') {
      const end = trimmed.indexOf(']', index)
      if (end === -1) return null

      const body = trimmed.slice(index + 1, end).trim()
      index = end + 1

      if (body === '*') {
        segments.push({ kind: 'wildcard' })
        continue
      }
      if (/^-?\d+$/.test(body)) {
        segments.push({ kind: 'index', index: Number(body) })
        continue
      }
      if (/^-?\d*:-?\d*$/.test(body)) {
        const [from = '', to = ''] = body.split(':')
        segments.push({
          kind: 'slice',
          from: from === '' ? 0 : Number(from),
          to: to === '' ? Number.POSITIVE_INFINITY : Number(to),
        })
        continue
      }

      const quoted = /^['"](.*)['"]$/.exec(body)
      if (!quoted) return null
      segments.push({ kind: 'key', name: quoted[1] as string })
      continue
    }

    // A bare leading key, as in "users[0].name" without the $ prefix.
    const match = /^([A-Za-z_$][\w$]*)/.exec(trimmed.slice(index))
    if (!match) return null
    segments.push({ kind: 'key', name: match[1] as string })
    index += match[0].length
  }

  return segments
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function descend(value: unknown, name: string, path: string, into: PathMatch[]): void {
  if (Array.isArray(value)) {
    value.forEach((item, index) => descend(item, name, `${path}[${index}]`, into))
    return
  }

  if (!isRecord(value)) return

  for (const [key, nested] of Object.entries(value)) {
    const childPath = `${path}.${key}`
    if (key === name) into.push({ path: childPath, value: nested })
    descend(nested, name, childPath, into)
  }
}

export function queryJson(json: string, path: string): Result<PathMatch[]> {
  if (json.trim() === '') return err('error.emptyInput')

  let root: unknown
  try {
    root = JSON.parse(json)
  } catch {
    return err('error.invalidJson')
  }

  const segments = parsePath(path)
  if (segments === null) return err('error.invalidPath')

  let current: PathMatch[] = [{ path: '$', value: root }]

  for (const segment of segments) {
    const next: PathMatch[] = []

    for (const match of current) {
      switch (segment.kind) {
        case 'key':
          if (isRecord(match.value) && segment.name !== undefined && segment.name in match.value) {
            next.push({ path: `${match.path}.${segment.name}`, value: match.value[segment.name] })
          }
          break
        case 'index': {
          if (!Array.isArray(match.value) || segment.index === undefined) break
          const position = segment.index < 0 ? match.value.length + segment.index : segment.index
          if (position >= 0 && position < match.value.length) {
            next.push({ path: `${match.path}[${position}]`, value: match.value[position] })
          }
          break
        }
        case 'slice': {
          if (!Array.isArray(match.value)) break
          const from = Math.max(0, segment.from ?? 0)
          const to = Math.min(match.value.length, segment.to ?? match.value.length)
          for (let position = from; position < to; position += 1) {
            next.push({ path: `${match.path}[${position}]`, value: match.value[position] })
          }
          break
        }
        case 'wildcard':
          if (Array.isArray(match.value)) {
            match.value.forEach((item, index) =>
              next.push({ path: `${match.path}[${index}]`, value: item }),
            )
          } else if (isRecord(match.value)) {
            for (const [key, nested] of Object.entries(match.value)) {
              next.push({ path: `${match.path}.${key}`, value: nested })
            }
          }
          break
        case 'descend':
          if (segment.name !== undefined) descend(match.value, segment.name, match.path, next)
          break
      }
    }

    current = next
  }

  return ok(current)
}
