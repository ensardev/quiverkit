import { describe, expect, it } from 'vitest'
import { buildQueryUrl, describeTtl, parseResponse } from './dns.js'

describe('buildQueryUrl', () => {
  it('builds a DNS-over-HTTPS query', () => {
    const result = buildQueryUrl('example.com', 'A')
    expect(result.ok && result.value).toContain('name=example.com')
    expect(result.ok && result.value).toContain('type=A')
  })

  it('strips a scheme and a path if one is pasted in', () => {
    expect(buildQueryUrl('https://example.com/some/page', 'MX')).toMatchObject({ ok: true })
  })

  it('rejects anything that is not a hostname', () => {
    expect(buildQueryUrl('not a domain', 'A')).toEqual({ ok: false, error: 'error.invalidDomain' })
    expect(buildQueryUrl('localhost', 'A')).toEqual({ ok: false, error: 'error.invalidDomain' })
    expect(buildQueryUrl('-bad.com', 'A')).toEqual({ ok: false, error: 'error.invalidDomain' })
    expect(buildQueryUrl('  ', 'A')).toEqual({ ok: false, error: 'error.emptyInput' })
  })
})

describe('parseResponse', () => {
  it('reads answers and names their record type', () => {
    const result = parseResponse({
      Status: 0,
      Answer: [{ name: 'example.com.', type: 1, TTL: 300, data: '93.184.216.34' }],
    })

    expect(result).toEqual({
      ok: true,
      value: [{ name: 'example.com', type: 'A', ttl: 300, value: '93.184.216.34' }],
    })
  })

  it('strips the quotes around a TXT record', () => {
    const result = parseResponse({
      Status: 0,
      Answer: [{ name: 'x.com.', type: 16, TTL: 60, data: '"v=spf1 -all"' }],
    })

    expect(result.ok && result.value[0]?.value).toBe('v=spf1 -all')
  })

  it('treats a missing name as an empty answer, not a failure', () => {
    expect(parseResponse({ Status: 3 })).toEqual({ ok: true, value: [] })
    expect(parseResponse({ Status: 0 })).toEqual({ ok: true, value: [] })
  })

  it('reports a resolver error', () => {
    expect(parseResponse({ Status: 2 })).toEqual({ ok: false, error: 'error.networkFailed' })
    expect(parseResponse('nonsense')).toEqual({ ok: false, error: 'error.networkFailed' })
  })
})

describe('describeTtl', () => {
  it('picks the unit that reads best', () => {
    expect(describeTtl(45)).toEqual({ amount: 45, unit: 'second' })
    expect(describeTtl(300)).toEqual({ amount: 5, unit: 'minute' })
    expect(describeTtl(7200)).toEqual({ amount: 2, unit: 'hour' })
    expect(describeTtl(172_800)).toEqual({ amount: 2, unit: 'day' })
  })
})
