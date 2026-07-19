import { err, ok, type Result } from '../result.js'

type Shape =
  | { kind: 'string' | 'number' | 'boolean' | 'null' | 'unknown' }
  | { kind: 'array'; item: Shape }
  | { kind: 'object'; fields: Map<string, { shape: Shape; optional: boolean }> }

function describe(value: unknown): Shape {
  if (value === null) return { kind: 'null' }
  if (Array.isArray(value)) return { kind: 'array', item: mergeAll(value.map(describe)) }

  switch (typeof value) {
    case 'string':
      return { kind: 'string' }
    case 'number':
      return { kind: 'number' }
    case 'boolean':
      return { kind: 'boolean' }
    case 'object': {
      const fields = new Map<string, { shape: Shape; optional: boolean }>()
      for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
        fields.set(key, { shape: describe(nested), optional: false })
      }
      return { kind: 'object', fields }
    }
    default:
      return { kind: 'unknown' }
  }
}

/**
 * Merges the shapes of every element in an array. A key present in some objects
 * but not others becomes optional, which is what makes generated types usable
 * against real API responses rather than only against the sample.
 */
function merge(left: Shape, right: Shape): Shape {
  if (left.kind === 'null') return right
  if (right.kind === 'null') return left
  if (left.kind !== right.kind) return { kind: 'unknown' }

  if (left.kind === 'array' && right.kind === 'array') {
    return { kind: 'array', item: merge(left.item, right.item) }
  }

  if (left.kind === 'object' && right.kind === 'object') {
    const fields = new Map(left.fields)

    for (const [key, entry] of right.fields) {
      const existing = fields.get(key)
      fields.set(
        key,
        existing
          ? { shape: merge(existing.shape, entry.shape), optional: existing.optional }
          : { ...entry, optional: true },
      )
    }

    for (const [key, entry] of fields) {
      if (!right.fields.has(key)) fields.set(key, { ...entry, optional: true })
    }

    return { kind: 'object', fields }
  }

  return left
}

function mergeAll(shapes: Shape[]): Shape {
  return shapes.length === 0 ? { kind: 'unknown' } : shapes.reduce(merge)
}

function pascal(name: string): string {
  const words = name.split(/[^a-zA-Z0-9]+/).filter(Boolean)
  return words.map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join('') || 'Root'
}

function singular(name: string): string {
  return name.endsWith('ies') ? `${name.slice(0, -3)}y` : name.replace(/s$/, '')
}

function isValidIdentifier(key: string): boolean {
  return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(key)
}

export function jsonToTypeScript(json: string, rootName = 'Root'): Result<string> {
  if (json.trim() === '') return err('error.emptyInput')

  let parsed: unknown
  try {
    parsed = JSON.parse(json)
  } catch {
    return err('error.invalidJson')
  }

  const interfaces: string[] = []
  const used = new Set<string>()

  const render = (shape: Shape, name: string): string => {
    switch (shape.kind) {
      case 'array':
        return `${render(shape.item, singular(name))}[]`
      case 'object': {
        let typeName = pascal(name)
        let suffix = 2
        while (used.has(typeName)) typeName = `${pascal(name)}${suffix++}`
        used.add(typeName)

        const lines = [...shape.fields].map(([key, entry]) => {
          const property = isValidIdentifier(key) ? key : JSON.stringify(key)
          return `  ${property}${entry.optional ? '?' : ''}: ${render(entry.shape, key)}`
        })

        interfaces.push(`export interface ${typeName} {\n${lines.join('\n')}\n}`)
        return typeName
      }
      case 'null':
        return 'null'
      case 'unknown':
        return 'unknown'
      default:
        return shape.kind
    }
  }

  const root = render(describe(parsed), rootName)
  if (interfaces.length === 0) return ok(`export type ${pascal(rootName)} = ${root}`)

  return ok(interfaces.reverse().join('\n\n'))
}

export function jsonToSchema(json: string, indent = 2): Result<string> {
  if (json.trim() === '') return err('error.emptyInput')

  let parsed: unknown
  try {
    parsed = JSON.parse(json)
  } catch {
    return err('error.invalidJson')
  }

  const build = (shape: Shape): Record<string, unknown> => {
    switch (shape.kind) {
      case 'array':
        return { type: 'array', items: build(shape.item) }
      case 'object': {
        const properties: Record<string, unknown> = {}
        const required: string[] = []

        for (const [key, entry] of shape.fields) {
          properties[key] = build(entry.shape)
          if (!entry.optional) required.push(key)
        }

        return required.length > 0
          ? { type: 'object', properties, required }
          : { type: 'object', properties }
      }
      case 'unknown':
        return {}
      default:
        return { type: shape.kind }
    }
  }

  return ok(
    JSON.stringify(
      { $schema: 'https://json-schema.org/draft/2020-12/schema', ...build(describe(parsed)) },
      null,
      indent,
    ),
  )
}
