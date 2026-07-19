import { describe, expect, it } from 'vitest'
import { diffLines } from './diff.js'

const shape = (left: string, right: string, options?: Parameters<typeof diffLines>[2]) =>
  diffLines(left, right, options).lines.map((line) => `${line.operation}:${line.value}`)

describe('diffLines', () => {
  it('marks identical text as unchanged', () => {
    const result = diffLines('a\nb', 'a\nb')
    expect(result.added).toBe(0)
    expect(result.removed).toBe(0)
    expect(result.unchanged).toBe(2)
  })

  it('spots an inserted line', () => {
    expect(shape('a\nc', 'a\nb\nc')).toEqual(['equal:a', 'insert:b', 'equal:c'])
  })

  it('spots a removed line', () => {
    expect(shape('a\nb\nc', 'a\nc')).toEqual(['equal:a', 'delete:b', 'equal:c'])
  })

  it('shows a changed line as a removal plus an insertion', () => {
    expect(shape('a\nb\nc', 'a\nB\nc')).toEqual(['equal:a', 'delete:b', 'insert:B', 'equal:c'])
  })

  it('numbers the lines on each side', () => {
    const { lines } = diffLines('a\nb', 'a\nx\nb')
    expect(lines.map((line) => [line.left, line.right])).toEqual([
      [1, 1],
      [undefined, 2],
      [2, 3],
    ])
  })

  it('can ignore case and whitespace while still showing the original text', () => {
    expect(shape('Hello   World', 'hello world', { ignoreCase: true, ignoreWhitespace: true })).toEqual([
      'equal:Hello   World',
    ])
    expect(shape('Hello', 'hello', { ignoreCase: false, ignoreWhitespace: false })).toEqual([
      'delete:Hello',
      'insert:hello',
    ])
  })

  it('handles one side being empty', () => {
    expect(diffLines('', 'a\nb').added).toBe(2)
    expect(diffLines('a\nb', '').removed).toBe(2)
  })

  it('keeps a long shared body cheap', () => {
    const body = Array.from({ length: 3000 }, (_, index) => `line ${index}`).join('\n')
    const result = diffLines(body, `${body}\nextra`)
    expect(result.added).toBe(1)
    expect(result.removed).toBe(0)
  })
})
