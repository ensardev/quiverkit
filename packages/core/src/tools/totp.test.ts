import { describe, expect, it } from 'vitest'
import { DEFAULT_TOTP, generateTotp, parseOtpUri } from './totp.js'

// The RFC 6238 test vector: the ASCII secret "12345678901234567890" in base32.
const SECRET = 'GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ'

async function codeAt(seconds: number, overrides = {}) {
  const result = await generateTotp(
    { ...DEFAULT_TOTP, secret: SECRET, ...overrides },
    new Date(seconds * 1000),
  )
  if (!result.ok) throw new Error(`expected a code, got ${result.error}`)
  return result.value
}

describe('generateTotp', () => {
  it('matches the RFC 6238 test vectors', async () => {
    // Published values for 8-digit SHA-1 codes at these instants.
    expect((await codeAt(59, { digits: 8 })).code).toBe('94287082')
    expect((await codeAt(1111111109, { digits: 8 })).code).toBe('07081804')
    expect((await codeAt(1234567890, { digits: 8 })).code).toBe('89005924')
  })

  it('keeps the counter 64-bit, so codes past 2038 stay correct', async () => {
    // A 32-bit write would drop the high half and give a different code here.
    expect((await codeAt(2000000000, { digits: 8 })).code).toBe('69279037')
  })

  it('produces the requested number of digits', async () => {
    expect((await codeAt(59)).code).toHaveLength(6)
    expect((await codeAt(59, { digits: 8 })).code).toHaveLength(8)
  })

  // 1_000_000_020 is divisible by 30, so it sits exactly on a period boundary.
  const BOUNDARY = 1_000_000_020

  it('holds the same code for the whole period and changes after it', async () => {
    const first = await codeAt(BOUNDARY)
    const same = await codeAt(BOUNDARY + 29)
    const next = await codeAt(BOUNDARY + 30)

    expect(same.code).toBe(first.code)
    expect(next.code).not.toBe(first.code)
  })

  it('counts down the seconds left', async () => {
    expect((await codeAt(BOUNDARY)).remaining).toBe(30)
    expect((await codeAt(BOUNDARY + 25)).remaining).toBe(5)
  })

  it('rejects a secret that is not base32', async () => {
    await expect(generateTotp({ ...DEFAULT_TOTP, secret: 'not base 32!' })).resolves.toEqual({
      ok: false,
      error: 'error.invalidSecret',
    })
  })
})

describe('parseOtpUri', () => {
  it('reads the uri an authenticator app encodes', () => {
    const result = parseOtpUri(
      'otpauth://totp/QuiverKit:ada@example.com?secret=JBSWY3DPEHPK3PXP&issuer=QuiverKit&digits=6&period=30',
    )

    expect(result).toEqual({
      ok: true,
      value: {
        secret: 'JBSWY3DPEHPK3PXP',
        label: 'QuiverKit:ada@example.com',
        issuer: 'QuiverKit',
        digits: 6,
        period: 30,
        algorithm: 'SHA-1',
      },
    })
  })

  it('rejects anything that is not an otpauth uri', () => {
    expect(parseOtpUri('https://example.com')).toEqual({ ok: false, error: 'error.invalidSecret' })
  })
})
