import { describe, expect, it } from 'vitest'
import { stripHtml } from './html.js'

describe('stripHtml', () => {
  it('removes tags', () => {
    const result = stripHtml('<p>Hello <b>world</b></p>')
    expect(result.ok).toBe(true)
    expect(result.ok && result.value).toBe('Hello world')
  })

  it('decodes entities', () => {
    const result = stripHtml('a &amp; b &lt; c &gt; d')
    expect(result.ok && result.value).toBe('a & b < c > d')
  })

  it('decodes numeric entities', () => {
    const result = stripHtml('&#65; &#x42;')
    expect(result.ok && result.value).toBe('A B')
  })

  it('removes script and style contents', () => {
    const result = stripHtml('hello<script>alert("x")</script> world')
    expect(result.ok && result.value).toBe('hello world')
  })

  it('returns empty input error', () => {
    expect(stripHtml('')).toEqual({ ok: false, error: 'error.emptyInput' })
  })

  it('replaces block elements with newlines', () => {
    const result = stripHtml('<div>one</div><p>two</p>')
    expect(result.ok && result.value).toContain('one')
    expect(result.ok && result.value).toContain('two')
  })
})
