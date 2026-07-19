import { describe, expect, it } from 'vitest'
import { convertCase, slugify, sortLines, splitWords, textStats } from './text.js'

describe('splitWords', () => {
  it('breaks camelCase, acronyms and separators apart', () => {
    expect(splitWords('getHTTPResponse_code 2')).toEqual([
      'get',
      'HTTP',
      'Response',
      'code',
      '2',
    ])
  })

  it('keeps non-ascii letters as letters', () => {
    expect(splitWords('kullanıcı-adı')).toEqual(['kullanıcı', 'adı'])
  })
})

describe('convertCase', () => {
  const input = 'hello world example'

  it('produces every style', () => {
    expect(convertCase(input, 'camel')).toBe('helloWorldExample')
    expect(convertCase(input, 'pascal')).toBe('HelloWorldExample')
    expect(convertCase(input, 'snake')).toBe('hello_world_example')
    expect(convertCase(input, 'constant')).toBe('HELLO_WORLD_EXAMPLE')
    expect(convertCase(input, 'kebab')).toBe('hello-world-example')
    expect(convertCase(input, 'dot')).toBe('hello.world.example')
    expect(convertCase(input, 'title')).toBe('Hello World Example')
    expect(convertCase(input, 'sentence')).toBe('Hello world example')
  })

  it('round-trips between styles', () => {
    expect(convertCase('HELLO_WORLD', 'camel')).toBe('helloWorld')
    expect(convertCase('hello-world', 'pascal')).toBe('HelloWorld')
  })

  it('keeps identifier styles locale-independent', () => {
    // A Turkish-aware lowercase would turn this into "ıd", which is not the
    // identifier anyone meant to write.
    expect(convertCase('ID_VALUE', 'camel', 'tr')).toBe('idValue')
    expect(convertCase('ID_VALUE', 'snake', 'tr')).toBe('id_value')
  })

  it('follows the language for plain lower and upper case', () => {
    expect(convertCase('istanbul', 'upper', 'tr')).toBe('İSTANBUL')
    expect(convertCase('istanbul', 'upper', 'en')).toBe('ISTANBUL')
    expect(convertCase('IĞDIR', 'lower', 'tr')).toBe('ığdır')
  })

  it('returns empty output for input without letters or digits', () => {
    expect(convertCase('---', 'snake')).toBe('')
  })
})

describe('slugify', () => {
  it('strips accents', () => {
    expect(slugify('Héllo Wörld')).toBe('hello-world')
  })

  it('handles letters that unicode cannot decompose', () => {
    expect(slugify('Yığın Açık')).toBe('yigin-acik')
    expect(slugify('Straße')).toBe('strasse')
    expect(slugify('Łódź')).toBe('lodz')
  })

  it('collapses separators and trims the edges', () => {
    expect(slugify('  --Hello,   World!--  ')).toBe('hello-world')
  })
})

describe('sortLines', () => {
  const base = { direction: 'asc', unique: false, caseSensitive: false, natural: false } as const

  it('sorts ascending and descending', () => {
    expect(sortLines('b\na\nc', base)).toBe('a\nb\nc')
    expect(sortLines('b\na\nc', { ...base, direction: 'desc' })).toBe('c\nb\na')
  })

  it('sorts numbers by value when natural sorting is on', () => {
    expect(sortLines('item10\nitem2', base)).toBe('item10\nitem2')
    expect(sortLines('item10\nitem2', { ...base, natural: true })).toBe('item2\nitem10')
  })

  it('removes duplicates', () => {
    expect(sortLines('a\nb\nA', { ...base, unique: true })).toBe('a\nb')
  })

  it('treats case as meaningful only when asked, and sorts lowercase first', () => {
    // Unicode collation puts "a" before "A"; that is the default everywhere and
    // not something we override.
    expect(sortLines('a\nb\nA', { ...base, unique: true, caseSensitive: true })).toBe('a\nA\nb')
  })

  it('follows the alphabet of the given locale', () => {
    // Turkish places ç directly after c; the default order puts it after z.
    expect(sortLines('d\nç\nc', { ...base, locale: 'tr' })).toBe('c\nç\nd')
  })
})

describe('textStats', () => {
  it('counts an emoji as one character', () => {
    const stats = textStats('🎯')
    expect(stats.characters).toBe(1)
    expect(stats.codeUnits).toBe(2)
    expect(stats.bytes).toBe(4)
  })

  it('counts both character totals in the same unit', () => {
    const stats = textStats('a 🎯')
    expect(stats.characters).toBe(3)
    expect(stats.charactersNoSpaces).toBe(2)
  })

  it('counts words in languages that do not use spaces', () => {
    expect(textStats('こんにちは世界', 'ja').words).toBeGreaterThan(1)
  })

  it('counts lines, sentences and paragraphs', () => {
    const stats = textStats('One two. Three!\n\nSecond block here.')
    expect(stats.words).toBe(6)
    expect(stats.sentences).toBe(3)
    expect(stats.paragraphs).toBe(2)
    expect(stats.lines).toBe(3)
  })

  it('reports zeroes for empty input', () => {
    expect(textStats('')).toMatchObject({ characters: 0, words: 0, lines: 0, readingSeconds: 0 })
  })
})
