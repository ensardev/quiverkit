import { describe, expect, it } from 'vitest'
import { compressText, decompressText } from './gzip.js'

describe('compressText', () => {
  it('compresses text and returns ratio', async () => {
    const result = await compressText('hello world hello world hello world')
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.value.compressedBytes).toBeGreaterThan(0)
      expect(result.value.ratio).toBeGreaterThan(0)
      expect(result.value.base64.length).toBeGreaterThan(0)
    }
  })

  it('returns empty input error', async () => {
    const result = await compressText('')
    expect(result).toEqual({ ok: false, error: 'error.emptyInput' })
  })
})

describe('decompressText', () => {
  it('round-trips', async () => {
    const original = 'The quick brown fox jumps over the lazy dog.'.repeat(10)
    const compressed = await compressText(original)
    expect(compressed.ok).toBe(true)
    if (!compressed.ok) return

    const decompressed = await decompressText(compressed.value.base64)
    expect(decompressed.ok).toBe(true)
    expect(decompressed.ok && decompressed.value).toBe(original)
  })

  it('returns empty input error', async () => {
    const result = await decompressText('')
    expect(result).toEqual({ ok: false, error: 'error.emptyInput' })
  })
})
