import { describe, expect, it } from 'vitest'
import { findInvisibles, stripInvisibles } from './invisible.js'

describe('findInvisibles', () => {
  it('finds nothing in ordinary text', () => {
    expect(findInvisibles('hello world\nsecond line')).toEqual([])
  })

  it('spots a zero width space', () => {
    const [found] = findInvisibles('he​llo')
    expect(found).toMatchObject({ index: 2, codePoint: 0x200b, kind: 'zeroWidth' })
    expect(found?.name).toBe('ZERO WIDTH SPACE')
  })

  it('spots the space that looks exactly like a normal one', () => {
    expect(findInvisibles('a b')[0]).toMatchObject({ kind: 'space', codePoint: 0x00a0 })
  })

  it('flags a byte order mark and windows line endings', () => {
    const kinds = findInvisibles('﻿text\r\n').map((found) => found.kind)
    expect(kinds).toContain('zeroWidth')
    expect(kinds).toContain('lineEnding')
  })

  it('flags bidi overrides, which can disguise what code says', () => {
    expect(findInvisibles('a‮b')[0]?.kind).toBe('bidi')
  })

  it('flags control characters but leaves newline and tab alone', () => {
    expect(findInvisibles('')[0]?.kind).toBe('control')
    expect(findInvisibles('\n')).toEqual([])
    expect(findInvisibles('\t')[0]?.kind).toBe('space')
  })
})

describe('stripInvisibles', () => {
  it('removes zero width characters', () => {
    expect(stripInvisibles('he​llo')).toBe('hello')
  })

  it('turns exotic spaces into ordinary ones by default', () => {
    expect(stripInvisibles('a b c')).toBe('a b c')
  })

  it('can delete them instead', () => {
    expect(stripInvisibles('a b', { normaliseSpaces: false })).toBe('ab')
  })

  it('drops carriage returns while keeping newlines', () => {
    expect(stripInvisibles('a\r\nb')).toBe('a\nb')
  })

  it('leaves clean text untouched', () => {
    expect(stripInvisibles('hello world')).toBe('hello world')
  })
})
