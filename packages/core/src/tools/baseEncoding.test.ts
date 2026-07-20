import { describe, expect, it } from 'vitest'
import {
  base32ToText,
  base58ToText,
  decodeBase32,
  decodeBase58,
  encodeBase32,
  encodeBase58,
  textToBase32,
  textToBase58,
} from './baseEncoding.js'

const bytes = (text: string) => new TextEncoder().encode(text)

describe('base32', () => {
  it('matches the RFC 4648 test vectors', () => {
    expect(encodeBase32(bytes(''))).toBe('')
    expect(encodeBase32(bytes('f'))).toBe('MY======')
    expect(encodeBase32(bytes('fo'))).toBe('MZXQ====')
    expect(encodeBase32(bytes('foo'))).toBe('MZXW6===')
    expect(encodeBase32(bytes('foobar'))).toBe('MZXW6YTBOI======')
  })

  it('round-trips text of any alphabet', () => {
    for (const sample of ['hello', 'İstanbul', 'こんにちは']) {
      const encoded = textToBase32(sample)
      expect(encoded.ok && base32ToText(encoded.value)).toEqual({ ok: true, value: sample })
    }
  })

  it('ignores padding, spacing and case', () => {
    expect(base32ToText('mzxw6ytb oi======')).toEqual({ ok: true, value: 'foobar' })
  })

  it('rejects characters outside the alphabet', () => {
    // 0, 1 and 8 are left out precisely because they look like O, I and B.
    expect(decodeBase32('MZXW0')).toEqual({ ok: false, error: 'error.invalidBase32' })
  })
})

describe('base58', () => {
  it('matches known encodings', () => {
    expect(encodeBase58(bytes('hello world'))).toBe('StV1DL6CwTryKyV')
    expect(encodeBase58(new Uint8Array([]))).toBe('')
  })

  it('keeps leading zero bytes as leading ones', () => {
    expect(encodeBase58(new Uint8Array([0, 0, 1]))).toBe('112')
    expect(decodeBase58('112')).toEqual({ ok: true, value: new Uint8Array([0, 0, 1]) })
  })

  it('round-trips', () => {
    const encoded = textToBase58('İstanbul 🎯')
    expect(encoded.ok && base58ToText(encoded.value)).toEqual({ ok: true, value: 'İstanbul 🎯' })
  })

  it('rejects the characters the alphabet leaves out', () => {
    for (const character of ['0', 'O', 'I', 'l']) {
      expect(decodeBase58(`abc${character}`)).toEqual({ ok: false, error: 'error.invalidBase58' })
    }
  })
})
