import { describe, expect, it } from 'vitest'
import { jsonToSchema, jsonToTypeScript } from './jsonTypes.js'

function types(json: string, name?: string) {
  const result = jsonToTypeScript(json, name)
  if (!result.ok) throw new Error(`expected ${json} to convert`)
  return result.value
}

describe('jsonToTypeScript', () => {
  it('names the fields and their primitive types', () => {
    expect(types('{"name":"Ada","age":36,"active":true}', 'User')).toContain('name: string')
    expect(types('{"age":36}', 'User')).toContain('age: number')
  })

  it('creates a nested interface for a nested object', () => {
    const output = types('{"user":{"name":"Ada"}}', 'Root')
    expect(output).toContain('export interface User {')
    expect(output).toContain('user: User')
  })

  it('marks a key missing from some array elements as optional', () => {
    const output = types('[{"a":1,"b":2},{"a":3}]', 'Item')
    expect(output).toContain('a: number')
    expect(output).toContain('b?: number')
  })

  it('quotes keys that are not valid identifiers', () => {
    expect(types('{"content-type":"json"}')).toContain('"content-type"')
  })

  it('handles an array of primitives', () => {
    expect(types('[1,2,3]', 'Numbers')).toContain('number[]')
  })

  it('reports invalid json', () => {
    expect(jsonToTypeScript('{oops}')).toEqual({ ok: false, error: 'error.invalidJson' })
  })
})

describe('jsonToSchema', () => {
  it('describes types and required keys', () => {
    const result = jsonToSchema('{"name":"Ada","age":36}', 0)
    if (!result.ok) throw new Error('expected the schema to build')

    const schema = JSON.parse(result.value)
    expect(schema.type).toBe('object')
    expect(schema.properties.name).toEqual({ type: 'string' })
    expect(schema.required).toEqual(['name', 'age'])
  })

  it('leaves optional keys out of required', () => {
    const result = jsonToSchema('[{"a":1,"b":2},{"a":3}]', 0)
    if (!result.ok) throw new Error('expected the schema to build')

    expect(JSON.parse(result.value).items.required).toEqual(['a'])
  })
})
