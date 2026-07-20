import { describe, expect, it } from 'vitest'
import { fromPunycode, toPunycode } from './punycode.js'

function encode(domain: string) {
  const result = toPunycode(domain)
  if (!result.ok) throw new Error(`expected ${domain} to encode`)
  return result.value
}

describe('punycode', () => {
  it('encodes the domains people actually hit', () => {
    expect(encode('münchen.de')).toBe('xn--mnchen-3ya.de')
    expect(encode('bücher.example')).toBe('xn--bcher-kva.example')
  })

  it('case-folds before encoding, the way a resolver would', () => {
    expect(encode('MÜNCHEN.DE')).toBe(encode('münchen.de'))

    // Turkish İ folds to "i" plus a combining dot, so the encoded form carries
    // that extra code point rather than a bare "i".
    const encoded = encode('İstanbul.tr')
    expect(encoded.startsWith('xn--')).toBe(true)
    expect(fromPunycode(encoded)).toEqual({ ok: true, value: 'i̇stanbul.tr' })
  })

  it('leaves plain ascii alone', () => {
    expect(encode('example.com')).toBe('example.com')
  })

  it('converts each label on its own', () => {
    expect(encode('köln.münchen.de')).toBe('xn--kln-sna.xn--mnchen-3ya.de')
  })

  it('round-trips', () => {
    for (const domain of ['münchen.de', 'köln.münchen.de', '日本.jp', 'example.com']) {
      expect(fromPunycode(encode(domain))).toEqual({ ok: true, value: domain.toLowerCase() })
    }
  })

  it('decodes a label that has no ascii part at all', () => {
    expect(fromPunycode('xn--wgv71a119e.jp')).toEqual({ ok: true, value: '日本語.jp' })
  })

  it('reports input it cannot decode', () => {
    expect(fromPunycode('xn--!!!.com')).toEqual({ ok: false, error: 'error.invalidDomain' })
    expect(toPunycode('  ')).toEqual({ ok: false, error: 'error.emptyInput' })
  })
})
