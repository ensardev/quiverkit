import { describe, expect, it } from 'vitest'
import { generateKeyPair, KEY_ALGORITHMS } from './keypair.js'

async function pair(algorithm: (typeof KEY_ALGORITHMS)[number]) {
  const result = await generateKeyPair(algorithm)
  if (!result.ok) throw new Error(`expected ${algorithm} to generate, got ${result.error}`)
  return result.value
}

describe('generateKeyPair', () => {
  it('wraps both keys in the right PEM headers', async () => {
    const keys = await pair('ECDSA-P256')

    expect(keys.publicKey.startsWith('-----BEGIN PUBLIC KEY-----')).toBe(true)
    expect(keys.publicKey.trimEnd().endsWith('-----END PUBLIC KEY-----')).toBe(true)
    expect(keys.privateKey.startsWith('-----BEGIN PRIVATE KEY-----')).toBe(true)
    expect(keys.privateKey.trimEnd().endsWith('-----END PRIVATE KEY-----')).toBe(true)
  })

  it('wraps the base64 body at 64 characters, as PEM requires', async () => {
    const keys = await pair('ECDSA-P256')
    const body = keys.privateKey.split('\n').slice(1, -1)

    expect(body.length).toBeGreaterThan(0)
    for (const line of body) expect(line.length).toBeLessThanOrEqual(64)
  })

  it('produces a body that decodes as base64', async () => {
    const keys = await pair('ECDSA-P256')
    const body = keys.publicKey.split('\n').slice(1, -1).join('')

    expect(() => atob(body)).not.toThrow()
    expect(atob(body).length).toBeGreaterThan(0)
  })

  it('never repeats a key', async () => {
    const [first, second] = await Promise.all([pair('ECDSA-P256'), pair('ECDSA-P256')])
    expect(first.privateKey).not.toBe(second.privateKey)
  })

  it('generates an RSA pair, whose keys are far longer', async () => {
    const [elliptic, rsa] = await Promise.all([pair('ECDSA-P256'), pair('RSA-2048')])
    expect(rsa.privateKey.length).toBeGreaterThan(elliptic.privateKey.length)
  })

  it('reports failure instead of throwing when the browser lacks the algorithm', async () => {
    // Ed25519 is recent enough that some engines still refuse it; either
    // outcome is acceptable, a thrown exception is not.
    const result = await generateKeyPair('Ed25519')
    expect(result.ok ? result.value.publicKey : result.error).toBeTruthy()
  })
})
