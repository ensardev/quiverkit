export type InvisibleKind = 'zeroWidth' | 'space' | 'control' | 'bidi' | 'lineEnding'

export interface InvisibleCharacter {
  index: number
  codePoint: number
  /** The official Unicode name, which is the same in every language. */
  name: string
  kind: InvisibleKind
}

interface Entry {
  name: string
  kind: InvisibleKind
}

/**
 * Characters that are invisible or look identical to an ordinary space, and so
 * survive a copy-paste unnoticed. They are behind a whole genre of bug reports:
 * a config key that will not match, a password that is rejected, a regex that
 * silently fails.
 */
const KNOWN: Record<number, Entry> = {
  0x0009: { name: 'CHARACTER TABULATION', kind: 'space' },
  0x000d: { name: 'CARRIAGE RETURN', kind: 'lineEnding' },
  0x00a0: { name: 'NO-BREAK SPACE', kind: 'space' },
  0x00ad: { name: 'SOFT HYPHEN', kind: 'zeroWidth' },
  0x180e: { name: 'MONGOLIAN VOWEL SEPARATOR', kind: 'zeroWidth' },
  0x2000: { name: 'EN QUAD', kind: 'space' },
  0x2001: { name: 'EM QUAD', kind: 'space' },
  0x2002: { name: 'EN SPACE', kind: 'space' },
  0x2003: { name: 'EM SPACE', kind: 'space' },
  0x2004: { name: 'THREE-PER-EM SPACE', kind: 'space' },
  0x2005: { name: 'FOUR-PER-EM SPACE', kind: 'space' },
  0x2006: { name: 'SIX-PER-EM SPACE', kind: 'space' },
  0x2007: { name: 'FIGURE SPACE', kind: 'space' },
  0x2008: { name: 'PUNCTUATION SPACE', kind: 'space' },
  0x2009: { name: 'THIN SPACE', kind: 'space' },
  0x200a: { name: 'HAIR SPACE', kind: 'space' },
  0x200b: { name: 'ZERO WIDTH SPACE', kind: 'zeroWidth' },
  0x200c: { name: 'ZERO WIDTH NON-JOINER', kind: 'zeroWidth' },
  0x200d: { name: 'ZERO WIDTH JOINER', kind: 'zeroWidth' },
  0x200e: { name: 'LEFT-TO-RIGHT MARK', kind: 'bidi' },
  0x200f: { name: 'RIGHT-TO-LEFT MARK', kind: 'bidi' },
  0x202a: { name: 'LEFT-TO-RIGHT EMBEDDING', kind: 'bidi' },
  0x202b: { name: 'RIGHT-TO-LEFT EMBEDDING', kind: 'bidi' },
  0x202c: { name: 'POP DIRECTIONAL FORMATTING', kind: 'bidi' },
  0x202d: { name: 'LEFT-TO-RIGHT OVERRIDE', kind: 'bidi' },
  0x202e: { name: 'RIGHT-TO-LEFT OVERRIDE', kind: 'bidi' },
  0x202f: { name: 'NARROW NO-BREAK SPACE', kind: 'space' },
  0x205f: { name: 'MEDIUM MATHEMATICAL SPACE', kind: 'space' },
  0x2060: { name: 'WORD JOINER', kind: 'zeroWidth' },
  0x2066: { name: 'LEFT-TO-RIGHT ISOLATE', kind: 'bidi' },
  0x2067: { name: 'RIGHT-TO-LEFT ISOLATE', kind: 'bidi' },
  0x2068: { name: 'FIRST STRONG ISOLATE', kind: 'bidi' },
  0x2069: { name: 'POP DIRECTIONAL ISOLATE', kind: 'bidi' },
  0x3000: { name: 'IDEOGRAPHIC SPACE', kind: 'space' },
  0xfeff: { name: 'ZERO WIDTH NO-BREAK SPACE (BOM)', kind: 'zeroWidth' },
}

export function findInvisibles(input: string): InvisibleCharacter[] {
  const found: InvisibleCharacter[] = []

  for (let index = 0; index < input.length; index += 1) {
    const codePoint = input.codePointAt(index)
    if (codePoint === undefined) continue

    const entry = KNOWN[codePoint]
    if (entry) {
      found.push({ index, codePoint, name: entry.name, kind: entry.kind })
      continue
    }

    // Control characters have no entry of their own but are just as invisible;
    // newline and the tab above are the two everyone expects to be there.
    if ((codePoint < 0x20 && codePoint !== 0x0a) || codePoint === 0x7f) {
      found.push({
        index,
        codePoint,
        name: `CONTROL U+${codePoint.toString(16).toUpperCase().padStart(4, '0')}`,
        kind: 'control',
      })
    }
  }

  return found
}

export interface CleanOptions {
  /** Turns every exotic space into a plain one instead of deleting it. */
  normaliseSpaces: boolean
}

export function stripInvisibles(
  input: string,
  options: CleanOptions = { normaliseSpaces: true },
): string {
  return [...input]
    .map((character) => {
      const codePoint = character.codePointAt(0)
      if (codePoint === undefined) return character

      const found = findInvisibles(character)[0]
      if (!found) return character
      if (found.kind === 'space' && options.normaliseSpaces) return codePoint === 0x09 ? '\t' : ' '
      if (found.kind === 'lineEnding') return ''

      return ''
    })
    .join('')
}
