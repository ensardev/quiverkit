import { err, ok, type Result } from '../result.js'

export const ESCAPE_FLAVOURS = ['json', 'html', 'sql', 'shell', 'regex'] as const

export type EscapeFlavour = (typeof ESCAPE_FLAVOURS)[number]

const HTML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}

const NAMED_ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
}

export function escapeText(input: string, flavour: EscapeFlavour): string {
  switch (flavour) {
    case 'json':
      // JSON.stringify handles control characters and surrogates correctly;
      // the slice drops the quotes it wraps around the result.
      return JSON.stringify(input).slice(1, -1)
    case 'html':
      return input.replaceAll(/[&<>"']/g, (character) => HTML_ENTITIES[character] ?? character)
    case 'sql':
      // Doubling the quote is the form every SQL dialect agrees on; backslash
      // escapes are MySQL-specific and break elsewhere.
      return input.replaceAll("'", "''")
    case 'shell':
      // Single quotes protect everything except a single quote itself, which has
      // to leave the quoted run, be escaped, and re-enter it.
      return `'${input.replaceAll("'", `'\\''`)}'`
    case 'regex':
      return input.replaceAll(/[.*+?^${}()|[\]\\/-]/g, (character) => `\\${character}`)
  }
}

export function unescapeText(input: string, flavour: EscapeFlavour): Result<string> {
  if (input === '') return err('error.emptyInput')

  switch (flavour) {
    case 'json':
      try {
        return ok(JSON.parse(`"${input.replaceAll(/(?<!\\)"/g, '\\"')}"`) as string)
      } catch {
        return err('error.invalidJson')
      }
    case 'html':
      return ok(
        input.replaceAll(/&(#x?[0-9a-f]+|[a-z]+);/gi, (entity, body: string) => {
          if (body.startsWith('#x') || body.startsWith('#X')) {
            return String.fromCodePoint(Number.parseInt(body.slice(2), 16))
          }
          if (body.startsWith('#')) return String.fromCodePoint(Number.parseInt(body.slice(1), 10))
          return NAMED_ENTITIES[body.toLowerCase()] ?? entity
        }),
      )
    case 'sql':
      return ok(input.replaceAll("''", "'"))
    case 'shell':
      return ok(input.replace(/^'|'$/g, '').replaceAll(`'\\''`, "'"))
    case 'regex':
      return ok(input.replaceAll(/\\(.)/g, '$1'))
  }
}
