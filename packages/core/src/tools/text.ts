/**
 * Letters that Unicode cannot decompose into "base + accent", so NFD alone
 * leaves them untouched. Turkish ı is the one people hit first: without this
 * map, "yığın" slugifies to "yıın".
 */
const TRANSLITERATIONS: Record<string, string> = {
  ı: 'i',
  İ: 'i',
  ø: 'o',
  Ø: 'o',
  ł: 'l',
  Ł: 'l',
  đ: 'd',
  Đ: 'd',
  ß: 'ss',
  æ: 'ae',
  Æ: 'ae',
  œ: 'oe',
  Œ: 'oe',
  þ: 'th',
  Þ: 'th',
}

function transliterate(input: string): string {
  return [...input].map((character) => TRANSLITERATIONS[character] ?? character).join('')
}

/**
 * Splits "getHTTPResponse_code 2" into ["get", "HTTP", "Response", "code", "2"].
 * The two passes handle the awkward case: a run of capitals followed by a word,
 * where the boundary belongs before the last capital, not after it.
 */
export function splitWords(input: string): string[] {
  return input
    .replace(/(\p{Ll}|\p{N})(\p{Lu})/gu, '$1 $2')
    .replace(/(\p{Lu}+)(\p{Lu}\p{Ll})/gu, '$1 $2')
    .split(/[^\p{L}\p{N}]+/u)
    .filter((word) => word !== '')
}

export const CASE_STYLES = [
  'camel',
  'pascal',
  'snake',
  'constant',
  'kebab',
  'dot',
  'title',
  'sentence',
  'lower',
  'upper',
] as const

export type CaseStyle = (typeof CASE_STYLES)[number]

/**
 * Passing no locale gives the invariant rules, which is what identifiers need:
 * under Turkish rules "ID" lowercases to "ıd" and "istanbul" capitalises to
 * "İstanbul", neither of which any compiler accepts.
 */
function capitalise(word: string, locale?: string): string {
  return word.charAt(0).toLocaleUpperCase(locale) + word.slice(1).toLocaleLowerCase(locale)
}

/**
 * The styles split into two families.
 *
 * Identifier styles — camel, pascal, snake, constant, kebab, dot — ignore the
 * locale, because their output is code.
 *
 * Prose styles — title, sentence, lower, upper — follow it, because their
 * output is text a human reads. In Turkish that is the difference between
 * "İstanbul" and the misspelled "Istanbul".
 */
export function convertCase(input: string, style: CaseStyle, locale?: string): string {
  if (style === 'lower') return input.toLocaleLowerCase(locale)
  if (style === 'upper') return input.toLocaleUpperCase(locale)

  const words = splitWords(input)
  if (words.length === 0) return ''

  switch (style) {
    case 'camel':
      return words
        .map((word, index) => (index === 0 ? word.toLowerCase() : capitalise(word)))
        .join('')
    case 'pascal':
      return words.map((word) => capitalise(word)).join('')
    case 'snake':
      return words.map((word) => word.toLowerCase()).join('_')
    case 'constant':
      return words.map((word) => word.toUpperCase()).join('_')
    case 'kebab':
      return words.map((word) => word.toLowerCase()).join('-')
    case 'dot':
      return words.map((word) => word.toLowerCase()).join('.')
    case 'title':
      return words.map((word) => capitalise(word, locale)).join(' ')
    case 'sentence':
      return words
        .map((word, index) =>
          index === 0 ? capitalise(word, locale) : word.toLocaleLowerCase(locale),
        )
        .join(' ')
  }
}

export function slugify(input: string): string {
  return transliterate(input)
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export interface SortOptions {
  direction: 'asc' | 'desc'
  unique: boolean
  caseSensitive: boolean
  /** Compares embedded numbers by value, so item2 comes before item10. */
  natural: boolean
  /** Alphabet order is language-specific: in Turkish, ç sorts right after c. */
  locale?: string
}

export function sortLines(input: string, options: SortOptions): string {
  let lines = input.split(/\r?\n/)

  if (options.unique) {
    const seen = new Set<string>()
    lines = lines.filter((line) => {
      const key = options.caseSensitive ? line : line.toLocaleLowerCase(options.locale)
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  }

  const collator = new Intl.Collator(options.locale, {
    numeric: options.natural,
    sensitivity: options.caseSensitive ? 'variant' : 'base',
  })

  const sorted = [...lines].sort((a, b) => collator.compare(a, b))
  if (options.direction === 'desc') sorted.reverse()

  return sorted.join('\n')
}

export interface TextStats {
  /** User-visible characters: an emoji counts once, not twice. */
  characters: number
  charactersNoSpaces: number
  /** What `String.length` reports — useful when a database column limits it. */
  codeUnits: number
  bytes: number
  words: number
  lines: number
  sentences: number
  paragraphs: number
  readingSeconds: number
}

const WORDS_PER_MINUTE = 200

function countSegments(input: string, granularity: 'grapheme' | 'word', locale?: string): number {
  const segmenter = new Intl.Segmenter(locale, { granularity })
  let count = 0

  for (const segment of segmenter.segment(input)) {
    if (granularity === 'word' && !segment.isWordLike) continue
    count += 1
  }

  return count
}

/**
 * Word counting goes through `Intl.Segmenter` rather than splitting on spaces,
 * because Japanese and Chinese write sentences without them. Splitting on
 * whitespace would report "こんにちは世界" as one word.
 */
export function textStats(input: string, locale?: string): TextStats {
  const words = input === '' ? 0 : countSegments(input, 'word', locale)
  // Both character counts are graphemes; mixing units here would show "23" and
  // "23" for a string that clearly contains a space.
  const withoutSpaces = input.replace(/\s/gu, '')

  return {
    characters: input === '' ? 0 : countSegments(input, 'grapheme', locale),
    charactersNoSpaces: withoutSpaces === '' ? 0 : countSegments(withoutSpaces, 'grapheme', locale),
    codeUnits: input.length,
    bytes: new TextEncoder().encode(input).length,
    words,
    lines: input === '' ? 0 : input.split(/\r?\n/).length,
    sentences: (input.match(/[^.!?…。！？]+[.!?…。！？]+/gu) ?? []).length,
    paragraphs: input.split(/\n\s*\n/).filter((block) => block.trim() !== '').length,
    readingSeconds: Math.ceil((words / WORDS_PER_MINUTE) * 60),
  }
}
