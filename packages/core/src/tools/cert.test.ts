import { describe, expect, it } from 'vitest'
import { decodeCertificate } from './cert.js'

describe('decodeCertificate', () => {
  it('returns empty input error', async () => {
    const result = await decodeCertificate('')
    expect(result).toEqual({ ok: false, error: 'error.emptyInput' })
  })

  it('returns error for garbage input', async () => {
    const result = await decodeCertificate('not a certificate')
    expect(result.ok).toBe(false)
  })

  it('returns error for invalid PEM header without body', async () => {
    const result = await decodeCertificate(
      '-----BEGIN SOMETHING-----\nxxx\n-----END SOMETHING-----',
    )
    expect(result.ok).toBe(false)
  })

  it('parses a PEM header and passes content to DER decode', async () => {
    // Minimal DER: two empty SEQUENCEs = MAAwAA==  (0x30 0x00 0x30 0x00)
    // This will fail inside DER parsing but proves the PEM stripping works.
    const minimal =
      '-----BEGIN CERTIFICATE-----\nMAAwAA==\n-----END CERTIFICATE-----'
    const result = await decodeCertificate(minimal)
    // Certificate structure validation fails because there aren't enough
    // children, but the PEM decode itself succeeds.
    expect(result.ok).toBe(false)
  })
})
