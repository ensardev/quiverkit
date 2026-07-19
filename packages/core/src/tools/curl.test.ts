import { describe, expect, it } from 'vitest'
import { generateCode, parseCurl } from './curl.js'

function request(command: string) {
  const result = parseCurl(command)
  if (!result.ok) throw new Error(`expected the command to parse, got ${result.error}`)
  return result.value
}

describe('parseCurl', () => {
  it('reads method, url, headers and body', () => {
    const parsed = request(
      `curl -X POST https://api.example.com/users -H 'Content-Type: application/json' -d '{"name":"Ada"}'`,
    )

    expect(parsed).toEqual({
      method: 'POST',
      url: 'https://api.example.com/users',
      headers: [{ key: 'Content-Type', value: 'application/json' }],
      body: '{"name":"Ada"}',
    })
  })

  it('assumes POST when there is a body and GET when there is not', () => {
    expect(request('curl https://x.dev').method).toBe('GET')
    expect(request(`curl https://x.dev -d 'a=1'`).method).toBe('POST')
  })

  it('follows line continuations and skips flags it does not model', () => {
    const parsed = request(`curl -L --compressed \\\n  https://x.dev \\\n  -H "Accept: */*"`)
    expect(parsed.url).toBe('https://x.dev')
    expect(parsed.headers).toEqual([{ key: 'Accept', value: '*/*' }])
  })

  it('turns basic auth into a header', () => {
    expect(request('curl -u ada:secret https://x.dev').headers[0]).toEqual({
      key: 'Authorization',
      value: `Basic ${btoa('ada:secret')}`,
    })
  })

  it('rejects anything that is not a curl command', () => {
    expect(parseCurl('wget https://x.dev')).toEqual({ ok: false, error: 'error.invalidCurl' })
    expect(parseCurl('curl -X GET')).toEqual({ ok: false, error: 'error.invalidCurl' })
  })
})

describe('generateCode', () => {
  const parsed = request(`curl -X POST https://x.dev -H 'Accept: application/json' -d 'hello'`)

  it('emits code that carries the method, url, headers and body', () => {
    for (const target of ['fetch', 'axios', 'python', 'go'] as const) {
      const code = generateCode(parsed, target)
      expect(code).toContain('https://x.dev')
      expect(code).toContain('Accept')
      expect(code).toContain('hello')
    }
  })

  it('imports strings in Go only when there is a body', () => {
    expect(generateCode(parsed, 'go')).toContain('"strings"')
    expect(generateCode(request('curl https://x.dev'), 'go')).not.toContain('"strings"')
  })
})
