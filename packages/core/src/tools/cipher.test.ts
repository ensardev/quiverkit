import { describe, expect, it } from 'vitest'
import { applyCipher, CIPHERS, reverseCipher } from './cipher.js'

describe('applyCipher', () => {
  it('rotates letters by thirteen and leaves everything else alone', () => {
    expect(applyCipher('Hello, World!', 'rot13')).toBe('Uryyb, Jbeyq!')
  })

  it('shifts by the requested amount for caesar', () => {
    expect(applyCipher('abc', 'caesar', 3)).toBe('def')
    expect(applyCipher('xyz', 'caesar', 3)).toBe('abc')
  })

  it('mirrors the alphabet for atbash', () => {
    expect(applyCipher('abc', 'atbash')).toBe('zyx')
  })

  it('reverses without breaking an emoji in half', () => {
    // A naive split('') would tear the surrogate pair apart.
    expect(applyCipher('ab🎯', 'reverse')).toBe('🎯ba')
  })

  it('writes morse with a slash between words', () => {
    expect(applyCipher('sos me', 'morse')).toBe('... --- ... / -- .')
  })
})

describe('reverseCipher', () => {
  it('undoes every cipher', () => {
    const sample = 'Attack at dawn, 5 units!'

    for (const cipher of CIPHERS) {
      const encoded = applyCipher(sample, cipher, 7)
      const decoded = reverseCipher(encoded, cipher, 7)

      // Morse discards case and punctuation it does not know, so compare on the
      // lowercase form for that one.
      expect(decoded).toBe(cipher === 'morse' ? sample.toLowerCase() : sample)
    }
  })

  it('leaves rot13 and atbash unchanged when applied twice', () => {
    expect(applyCipher(applyCipher('hello', 'rot13'), 'rot13')).toBe('hello')
    expect(applyCipher(applyCipher('hello', 'atbash'), 'atbash')).toBe('hello')
  })
})
