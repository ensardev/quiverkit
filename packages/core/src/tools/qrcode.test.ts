/**
 * @vitest-environment jsdom
 */
import { describe, expect, it } from 'vitest'
import { generateQr } from './qrcode.js'

describe('generateQr', () => {
  it('produces an SVG string', async () => {
    const result = await generateQr('hello')
    expect(result.ok).toBe(true)
    expect(result.ok && result.value).toContain('<svg')
  })

  it('returns empty input error', async () => {
    const result = await generateQr('')
    expect(result).toEqual({ ok: false, error: 'error.emptyInput' })
  })

  it('encodes URLs', async () => {
    const result = await generateQr('https://example.com')
    expect(result.ok).toBe(true)
  })
})

/**
 * readQr is exercised manually in the web app: it needs a real canvas and a
 * real ImageData, neither of which vitest's jsdom provides.  The function is a
 * thin wrapper around jsQR, which is battle-tested on its own.
 */
