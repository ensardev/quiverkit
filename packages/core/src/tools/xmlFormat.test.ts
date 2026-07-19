import { describe, expect, it } from 'vitest'
import { formatXml, minifyXml } from './xmlFormat.js'

function format(markup: string) {
  const result = formatXml(markup)
  if (!result.ok) throw new Error(`expected ${markup} to format`)
  return result.value
}

describe('formatXml', () => {
  it('indents nested elements', () => {
    expect(format('<a><b><c/></b></a>')).toBe('<a>\n  <b>\n    <c/>\n  </b>\n</a>')
  })

  it('keeps an element with only text on one line', () => {
    expect(format('<root><title>Hello</title></root>')).toBe('<root>\n  <title>Hello</title>\n</root>')
  })

  it('does not indent after a void html tag', () => {
    const lines = format('<div><br><span>x</span></div>').split('\n')
    expect(lines[1]?.startsWith('  <br')).toBe(true)
    expect(lines[2]?.startsWith('  <span')).toBe(true)
  })

  it('keeps the declaration and comments', () => {
    const output = format('<?xml version="1.0"?><!-- note --><a/>')
    expect(output).toContain('<?xml version="1.0"?>')
    expect(output).toContain('<!-- note -->')
  })

  it('rejects empty input', () => {
    expect(formatXml('  ')).toEqual({ ok: false, error: 'error.emptyInput' })
  })
})

describe('minifyXml', () => {
  it('removes the whitespace between tags', () => {
    expect(minifyXml('<a>\n  <b>x</b>\n</a>')).toEqual({ ok: true, value: '<a><b>x</b></a>' })
  })
})
