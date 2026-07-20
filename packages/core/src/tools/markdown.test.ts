import { describe, expect, it } from 'vitest'
import { renderMarkdown } from './markdown.js'

describe('renderMarkdown', () => {
  it('renders bold', () => {
    const result = renderMarkdown('**hello**')
    expect(result.ok).toBe(true)
    expect(result.ok && result.value).toContain('<strong>hello</strong>')
  })

  it('renders headings', () => {
    const result = renderMarkdown('# Title')
    expect(result.ok).toBe(true)
    expect(result.ok && result.value).toContain('<h1')
  })

  it('renders code blocks', () => {
    const result = renderMarkdown('```js\nconst x = 1\n```')
    expect(result.ok).toBe(true)
    expect(result.ok && result.value).toContain('<code')
  })

  it('returns empty input error', () => {
    expect(renderMarkdown('')).toEqual({ ok: false, error: 'error.emptyInput' })
  })

  it('renders links', () => {
    const result = renderMarkdown('[click](https://example.com)')
    expect(result.ok).toBe(true)
    expect(result.ok && result.value).toContain('<a href="https://example.com"')
  })

  it('renders images', () => {
    const result = renderMarkdown('![alt](img.png)')
    expect(result.ok).toBe(true)
    expect(result.ok && result.value).toContain('<img')
  })

  it('renders lists', () => {
    const result = renderMarkdown('- one\n- two')
    expect(result.ok).toBe(true)
    expect(result.ok && result.value).toContain('<ul>')
    expect(result.ok && result.value).toContain('<li>')
  })
})
