import { describe, expect, it } from 'vitest'
import { csvToJson, DEFAULT_CSV, jsonToCsv, parseCsv } from './csv.js'

describe('parseCsv', () => {
  it('reads a header row and the body', () => {
    const result = parseCsv('name,age\nAda,36\nKenji,29')
    expect(result).toEqual({
      ok: true,
      value: { headers: ['name', 'age'], rows: [['Ada', '36'], ['Kenji', '29']] },
    })
  })

  it('keeps delimiters, newlines and quotes that sit inside a quoted field', () => {
    const result = parseCsv('a,b\n"one, two","line\nbreak"')
    expect(result.ok && result.value.rows[0]).toEqual(['one, two', 'line\nbreak'])
  })

  it('reads a doubled quote as a single one', () => {
    const result = parseCsv('a\n"she said ""hi"""')
    expect(result.ok && result.value.rows[0]?.[0]).toBe('she said "hi"')
  })

  it('invents column names when there is no header', () => {
    const result = parseCsv('1,2', { ...DEFAULT_CSV, hasHeader: false })
    expect(result.ok && result.value.headers).toEqual(['column1', 'column2'])
  })

  it('honours a different delimiter', () => {
    const result = parseCsv('a;b\n1;2', { delimiter: ';', hasHeader: true })
    expect(result.ok && result.value.rows[0]).toEqual(['1', '2'])
  })
})

describe('csvToJson', () => {
  it('turns numbers and booleans into real json values', () => {
    const result = csvToJson('name,age,active\nAda,36,true', DEFAULT_CSV, 0)
    expect(result.ok && JSON.parse(result.value)).toEqual([
      { name: 'Ada', age: 36, active: true },
    ])
  })

  it('leaves an empty cell as null', () => {
    const result = csvToJson('a,b\n1,', DEFAULT_CSV, 0)
    expect(result.ok && JSON.parse(result.value)).toEqual([{ a: 1, b: null }])
  })
})

describe('jsonToCsv', () => {
  it('uses the union of every object key so columns stay aligned', () => {
    const result = jsonToCsv('[{"a":1},{"b":2}]')
    expect(result).toEqual({ ok: true, value: 'a,b\n1,\n,2' })
  })

  it('quotes values that contain the delimiter or a quote', () => {
    const result = jsonToCsv('[{"a":"one, two"},{"a":"say \\"hi\\""}]')
    expect(result.ok && result.value.split('\n')[1]).toBe('"one, two"')
    expect(result.ok && result.value.split('\n')[2]).toBe('"say ""hi"""')
  })

  it('rejects json that is not an array of objects', () => {
    expect(jsonToCsv('{"a":1}')).toEqual({ ok: false, error: 'error.invalidCsv' })
    expect(jsonToCsv('nope')).toEqual({ ok: false, error: 'error.invalidJson' })
  })
})
