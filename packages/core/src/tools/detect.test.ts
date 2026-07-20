import { describe, expect, it } from 'vitest'
import { detect, type DetectionKind } from './detect.js'

const kinds = (input: string): DetectionKind[] => detect(input).map((entry) => entry.kind)
const best = (input: string): DetectionKind | undefined => detect(input)[0]?.kind

const TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9' +
  '.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ' +
  '.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'

describe('detect', () => {
  it('finds nothing in an empty input', () => {
    expect(detect('')).toEqual([])
    expect(detect('   ')).toEqual([])
  })

  it('recognises a JWT and reads its algorithm', () => {
    const [first] = detect(TOKEN)
    expect(first?.kind).toBe('jwt')
    expect(first?.tool).toBe('jwt')
    expect(first?.preview).toContain('HS256')
    expect(first?.preview).toContain('1234567890')
  })

  it('does not call three dot-separated words a JWT', () => {
    expect(kinds('one.two.three')).not.toContain('jwt')
  })

  it('recognises the everyday shapes', () => {
    expect(best('550e8400-e29b-41d4-a716-446655440000')).toBe('uuid')
    expect(best('{"a":1}')).toBe('json')
    expect(best('https://quiverkit.dev/jwt')).toBe('url')
    expect(best('192.168.1.1')).toBe('ipv4')
    expect(best('10.0.0.0/24')).toBe('cidr')
    expect(best('1.2.3-rc.1')).toBe('semver')
    expect(best('#3b82f6')).toBe('colour')
    expect(best('xn--mnchen-3ya.de')).toBe('punycode')
  })

  it('tells a certificate from a private key', () => {
    expect(detect('-----BEGIN CERTIFICATE-----\nMIIB\n-----END CERTIFICATE-----')[0]?.tool).toBe('cert')
    expect(detect('-----BEGIN PRIVATE KEY-----\nMIIB\n-----END PRIVATE KEY-----')[0]?.tool).toBe('keypair')
  })

  it('separates unix seconds from milliseconds', () => {
    const seconds = detect('1700000000')[0]
    const millis = detect('1700000000000')[0]

    expect(seconds?.kind).toBe('unixSeconds')
    expect(millis?.kind).toBe('unixMillis')
    expect(seconds?.preview).toBe(millis?.preview)
  })

  it('names a hash by its length', () => {
    expect(best('d41d8cd98f00b204e9800998ecf8427e')).toBe('md5')
    expect(best('da39a3ee5e6b4b0d3255bfef95601890afd80709')).toBe('sha1')
    expect(best('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855')).toBe('sha256')
  })

  it('decodes base64 into a preview', () => {
    const [first] = detect('SGVsbG8sIFF1aXZlcktpdCE=')
    expect(first?.kind).toBe('base64')
    expect(first?.preview).toBe('Hello, QuiverKit!')
  })

  it('trusts base64 less when it decodes to binary', () => {
    const text = detect('SGVsbG8sIFF1aXZlcktpdCE=')[0]
    const binary = detect('//79/Pv6+fj39vX08/Lx8A==').find((entry) => entry.kind === 'base64')

    expect(binary?.confidence).toBeLessThan(text?.confidence ?? 1)
  })

  it('spots encoded text that hides inside something else', () => {
    expect(kinds('caf%C3%A9%20latte')).toContain('urlEncoded')
    expect(detect('caf%C3%A9%20latte')[0]?.preview).toBe('café latte')
    expect(kinds('&lt;div&gt;')).toContain('htmlEntities')
  })

  it('orders the most certain reading first', () => {
    // A UUID is also valid hex once the dashes go, but the UUID reading wins.
    const results = detect('550e8400-e29b-41d4-a716-446655440000')
    expect(results[0]?.confidence).toBe(1)
    expect(results[0]?.kind).toBe('uuid')
  })

  it('can return several readings for one input', () => {
    // A cron line is five fields; so is any five-word sentence with a star.
    expect(kinds('*/15 9-17 * * mon-fri')).toContain('cron')
  })

  it('points every reading at a real tool', () => {
    for (const sample of [TOKEN, '{"a":1}', '#3b82f6', '1700000000', 'SGVsbG8=']) {
      for (const entry of detect(sample)) {
        // Tool ids are camelCase and may carry digits, as in "base64".
        expect(entry.tool).toMatch(/^[a-z][a-zA-Z0-9]*$/)
        expect(entry.confidence).toBeGreaterThan(0)
        expect(entry.confidence).toBeLessThanOrEqual(1)
      }
    }
  })
})
