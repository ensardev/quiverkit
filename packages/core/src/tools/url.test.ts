import { describe, expect, it } from 'vitest'
import { decodeUrlComponent, encodeUrl, encodeUrlComponent, parseUrl } from './url.js'

describe('url', () => {
  it('escapes reserved characters in components', () => {
    expect(encodeUrlComponent('a b&c=d')).toEqual({ ok: true, value: 'a%20b%26c%3Dd' })
  })

  it('leaves reserved characters alone in whole urls', () => {
    expect(encodeUrl('https://x.dev/a b?q=1&r=2')).toEqual({
      ok: true,
      value: 'https://x.dev/a%20b?q=1&r=2',
    })
  })

  it('round-trips non-ascii text', () => {
    const encoded = encodeUrlComponent('İstanbul çğü')
    expect(encoded.ok && decodeUrlComponent(encoded.value)).toEqual({
      ok: true,
      value: 'İstanbul çğü',
    })
  })

  it('reports truncated percent escapes', () => {
    expect(decodeUrlComponent('%E0%A4')).toEqual({ ok: false, error: 'error.invalidUrlEncoding' })
    expect(decodeUrlComponent('   ')).toEqual({ ok: false, error: 'error.emptyInput' })
  })

  it('splits a url into its parts', () => {
    const result = parseUrl('https://quiverkit.dev:8443/tools/jwt?lang=tr&debug=1#top')
    expect(result.ok).toBe(true)
    if (!result.ok) return

    expect(result.value).toEqual({
      protocol: 'https',
      host: 'quiverkit.dev',
      port: '8443',
      path: '/tools/jwt',
      hash: '#top',
      params: [
        { key: 'lang', value: 'tr' },
        { key: 'debug', value: '1' },
      ],
    })
  })
})
