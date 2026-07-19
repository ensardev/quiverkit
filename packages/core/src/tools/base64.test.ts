import { describe, expect, it } from 'vitest'
import { decodeBase64, decodeBase64Url, encodeBase64, encodeBase64Url } from './base64.js'

describe('base64', () => {
  it('round-trips text from any alphabet', () => {
    const samples = ['hello', 'çğıöşü İstanbul', 'こんにちは', '🎯 emoji', '']

    for (const sample of samples) {
      const encoded = encodeBase64(sample)
      expect(encoded.ok).toBe(true)
      if (!encoded.ok || sample === '') continue

      expect(decodeBase64(encoded.value)).toEqual({ ok: true, value: sample })
    }
  })

  it('matches known encodings', () => {
    expect(encodeBase64('hello')).toEqual({ ok: true, value: 'aGVsbG8=' })
    expect(decodeBase64('aGVsbG8=')).toEqual({ ok: true, value: 'hello' })
  })

  it('rejects empty and malformed input', () => {
    expect(decodeBase64('   ')).toEqual({ ok: false, error: 'error.emptyInput' })
    expect(decodeBase64('not base64!!')).toEqual({ ok: false, error: 'error.invalidBase64' })
  })

  it('reports binary payloads as invalid utf-8 instead of returning garbage', () => {
    expect(decodeBase64('//79')).toEqual({ ok: false, error: 'error.invalidUtf8' })
  })

  it('produces url-safe output without padding', () => {
    const encoded = encodeBase64Url('???>>>')
    expect(encoded.ok && encoded.value).not.toMatch(/[+/=]/)
    expect(decodeBase64Url(encoded.ok ? encoded.value : '')).toEqual({ ok: true, value: '???>>>' })
  })
})
