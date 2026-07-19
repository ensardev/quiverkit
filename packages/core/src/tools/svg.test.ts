import { describe, expect, it } from 'vitest'
import { optimiseSvg, toDataUri, toJsx } from './svg.js'

const MESSY = `<?xml version="1.0"?>
<!-- drawn by hand -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke-width="2">
  <title>An icon</title>
  <metadata>something</metadata>
  <path d="M4 4 L20 20" data-name="line" />
</svg>`

describe('optimiseSvg', () => {
  it('drops comments, declarations, titles and metadata', () => {
    const result = optimiseSvg(MESSY)
    if (!result.ok) throw new Error('expected the svg to optimise')

    expect(result.value.markup).not.toContain('<!--')
    expect(result.value.markup).not.toContain('<?xml')
    expect(result.value.markup).not.toContain('<title>')
    expect(result.value.markup).not.toContain('<metadata>')
    expect(result.value.markup).not.toContain('data-name')
  })

  it('keeps the parts that actually draw', () => {
    const result = optimiseSvg(MESSY)
    expect(result.ok && result.value.markup).toContain('viewBox="0 0 24 24"')
    expect(result.ok && result.value.markup).toContain('M4 4 L20 20')
  })

  it('reports how much it saved', () => {
    const result = optimiseSvg(MESSY)
    expect(result.ok && result.value.stats.after).toBeLessThan(
      result.ok ? result.value.stats.before : 0,
    )
  })

  it('rejects markup that is not an svg', () => {
    expect(optimiseSvg('<div/>')).toEqual({ ok: false, error: 'error.invalidSvg' })
  })
})

describe('toDataUri', () => {
  it('escapes the characters that would break a css url', () => {
    const result = toDataUri('<svg xmlns="http://www.w3.org/2000/svg"><path d="M0 0"/></svg>')
    if (!result.ok) throw new Error('expected the data uri to build')

    expect(result.value.startsWith('url("data:image/svg+xml,')).toBe(true)
    expect(result.value).toContain('%3Csvg')
    expect(result.value).not.toContain('<svg')
  })
})

describe('toJsx', () => {
  it('renames attributes to their JSX spelling', () => {
    const result = toJsx('<svg stroke-width="2" class="icon"><path/></svg>', 'Line')
    if (!result.ok) throw new Error('expected the jsx to build')

    expect(result.value).toContain('strokeWidth=')
    expect(result.value).toContain('className=')
    expect(result.value).toContain('export function Line(')
    expect(result.value).toContain('{...props}')
  })

  it('leaves data and aria attributes with their dashes', () => {
    const result = toJsx('<svg aria-hidden="true"><path/></svg>')
    expect(result.ok && result.value).toContain('aria-hidden=')
  })
})
