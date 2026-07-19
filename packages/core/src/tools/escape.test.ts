import { describe, expect, it } from 'vitest'
import { ESCAPE_FLAVOURS, escapeText, unescapeText } from './escape.js'

describe('escapeText', () => {
  it('escapes for json without the surrounding quotes', () => {
    expect(escapeText('line\n"quoted"\ttab', 'json')).toBe('line\\n\\"quoted\\"\\ttab')
  })

  it('escapes html entities', () => {
    expect(escapeText('<a href="x">&</a>', 'html')).toBe(
      '&lt;a href=&quot;x&quot;&gt;&amp;&lt;/a&gt;',
    )
  })

  it('doubles the quote for sql', () => {
    expect(escapeText("O'Brien", 'sql')).toBe("O''Brien")
  })

  it('wraps shell arguments so nothing expands', () => {
    expect(escapeText('rm -rf $HOME', 'shell')).toBe("'rm -rf $HOME'")
    expect(escapeText("it's", 'shell')).toBe(`'it'\\''s'`)
  })

  it('escapes regex metacharacters', () => {
    expect(escapeText('a.b*c', 'regex')).toBe('a\\.b\\*c')
  })
})

describe('unescapeText', () => {
  it('round-trips every flavour', () => {
    const samples: Record<string, string> = {
      json: 'line\nwith "quotes"',
      html: '<b>&amp;</b>',
      sql: "O'Brien",
      shell: "it's fine",
      regex: 'a.b*c',
    }

    for (const flavour of ESCAPE_FLAVOURS) {
      const original = samples[flavour] as string
      const escaped = escapeText(original, flavour)
      expect(unescapeText(escaped, flavour)).toEqual({ ok: true, value: original })
    }
  })

  it('decodes numeric html entities', () => {
    expect(unescapeText('&#65;&#x42;', 'html')).toEqual({ ok: true, value: 'AB' })
  })

  it('decodes &nbsp; to a real no-break space, not an ordinary one', () => {
    expect(unescapeText('a&nbsp;b', 'html')).toEqual({ ok: true, value: 'a b' })
  })

  it('leaves unknown entities alone', () => {
    expect(unescapeText('&notreal;', 'html')).toEqual({ ok: true, value: '&notreal;' })
  })

  it('reports empty input', () => {
    expect(unescapeText('', 'json')).toEqual({ ok: false, error: 'error.emptyInput' })
  })

  it('reports json that cannot be decoded', () => {
    expect(unescapeText('\\q', 'json')).toEqual({ ok: false, error: 'error.invalidJson' })
  })
})
