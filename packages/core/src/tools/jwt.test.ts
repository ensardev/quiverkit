import { describe, expect, it } from 'vitest'
import { claimAsDate, decodeJwt } from './jwt.js'

const TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9' +
  '.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ' +
  '.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'

describe('jwt', () => {
  it('decodes header and payload', () => {
    const result = decodeJwt(TOKEN)
    expect(result.ok).toBe(true)
    if (!result.ok) return

    expect(result.value.header).toEqual({ alg: 'HS256', typ: 'JWT' })
    expect(result.value.payload).toEqual({ sub: '1234567890', name: 'John Doe', iat: 1516239022 })
    expect(result.value.signature).toBe('SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c')
  })

  it('rejects anything that is not three segments', () => {
    expect(decodeJwt('abc.def')).toEqual({ ok: false, error: 'error.invalidJwt' })
    expect(decodeJwt('a.b.c.d')).toEqual({ ok: false, error: 'error.invalidJwt' })
    expect(decodeJwt('  ')).toEqual({ ok: false, error: 'error.emptyInput' })
  })

  it('rejects segments that are not json objects', () => {
    // "MQ" is base64url for the number 1, which decodes but is not a claim set.
    expect(decodeJwt('MQ.MQ.sig')).toEqual({ ok: false, error: 'error.invalidJwt' })
  })

  it('reads numeric claims as dates', () => {
    const result = decodeJwt(TOKEN)
    if (!result.ok) throw new Error('expected a valid token')

    expect(claimAsDate(result.value.payload, 'iat')?.toISOString()).toBe('2018-01-18T01:30:22.000Z')
    expect(claimAsDate(result.value.payload, 'exp')).toBeNull()
    expect(claimAsDate(result.value.payload, 'name')).toBeNull()
  })
})
