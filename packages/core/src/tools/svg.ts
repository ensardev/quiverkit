import { err, ok, type Result } from '../result.js'

export interface SvgStats {
  before: number
  after: number
}

export interface OptimisedSvg {
  markup: string
  stats: SvgStats
}

/** Editor leftovers that never affect rendering. */
const EDITOR_ATTRIBUTES = [
  /\s(?:sodipodi|inkscape|sketch|figma|serif):[\w-]+="[^"]*"/g,
  /\s(?:xmlns:)?(?:sodipodi|inkscape|sketch|figma|serif)(?::[\w-]+)?="[^"]*"/g,
  /\sdata-name="[^"]*"/g,
  /\s(?:id|class)="[^"]*"(?=[^>]*\/?>)/g,
]

export function optimiseSvg(markup: string, dropIds = true): Result<OptimisedSvg> {
  const trimmed = markup.trim()
  if (trimmed === '') return err('error.emptyInput')
  if (!trimmed.includes('<svg')) return err('error.invalidSvg')

  let output = trimmed
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<\?xml[\s\S]*?\?>/g, '')
    .replace(/<!DOCTYPE[\s\S]*?>/gi, '')
    .replace(/<(metadata|title|desc)[\s\S]*?<\/\1>/gi, '')

  for (const pattern of EDITOR_ATTRIBUTES.slice(0, dropIds ? undefined : 3)) {
    output = output.replace(pattern, '')
  }

  output = output
    // Collapse whitespace, but only between tags — text inside <text> matters.
    .replace(/>\s+</g, '><')
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+\/>/g, '/>')
    .trim()

  return ok({ markup: output, stats: { before: trimmed.length, after: output.length } })
}

/**
 * A data URI needs the characters that would end the URL escaped. Percent-
 * encoding only those keeps the result far shorter — and far more readable —
 * than base64, which inflates the payload by a third.
 */
export function toDataUri(markup: string): Result<string> {
  const optimised = optimiseSvg(markup)
  if (!optimised.ok) return optimised

  const encoded = optimised.value.markup
    .replaceAll('"', "'")
    .replaceAll('%', '%25')
    .replaceAll('#', '%23')
    .replaceAll('{', '%7B')
    .replaceAll('}', '%7D')
    .replaceAll('<', '%3C')
    .replaceAll('>', '%3E')
    .replaceAll('\n', '')

  return ok(`url("data:image/svg+xml,${encoded}")`)
}

const REACT_ATTRIBUTES: Record<string, string> = {
  class: 'className',
  for: 'htmlFor',
  'xlink:href': 'xlinkHref',
  tabindex: 'tabIndex',
}

export function toJsx(markup: string, componentName = 'Icon'): Result<string> {
  const optimised = optimiseSvg(markup, false)
  if (!optimised.ok) return optimised

  const jsx = optimised.value.markup
    .replace(/([a-zA-Z-]+):?([a-zA-Z-]*)=/g, (match, first: string, second: string) => {
      const attribute = second === '' ? first : `${first}:${second}`
      const mapped = REACT_ATTRIBUTES[attribute]
      if (mapped) return `${mapped}=`

      // JSX wants camelCase for hyphenated SVG attributes: stroke-width becomes
      // strokeWidth, but data-* and aria-* keep their dashes.
      if (attribute.startsWith('data-') || attribute.startsWith('aria-')) return match
      return `${attribute.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase())}=`
    })
    .replace(/<svg /, '<svg {...props} ')

  return ok(
    `export function ${componentName}(props: React.SVGProps<SVGSVGElement>) {\n  return (\n    ${jsx}\n  )\n}`,
  )
}
