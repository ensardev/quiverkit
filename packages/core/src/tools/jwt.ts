import { err, ok, type Result } from '../result.js'
import { decodeBase64Url } from './base64.js'

export interface DecodedJwt {
  header: Record<string, unknown>
  payload: Record<string, unknown>
  /** Left as-is: verifying it needs the signing key, which we never ask for. */
  signature: string
}

function decodeSegment(segment: string): Record<string, unknown> | null {
  const decoded = decodeBase64Url(segment)
  if (!decoded.ok) return null

  try {
    const parsed: unknown = JSON.parse(decoded.value)
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return null
    return parsed as Record<string, unknown>
  } catch {
    return null
  }
}

/**
 * Decoding a JWT is just base64url plus JSON — no key required, which is why it
 * is safe to do entirely in the browser. Pasting a production token into a
 * random website, on the other hand, hands over whatever it authorises.
 */
export function decodeJwt(token: string): Result<DecodedJwt> {
  const trimmed = token.trim()
  if (trimmed === '') return err('error.emptyInput')

  const parts = trimmed.split('.')
  if (parts.length !== 3) return err('error.invalidJwt')

  const [headerPart, payloadPart, signature] = parts
  if (headerPart === undefined || payloadPart === undefined || signature === undefined) {
    return err('error.invalidJwt')
  }

  const header = decodeSegment(headerPart)
  const payload = decodeSegment(payloadPart)
  if (!header || !payload) return err('error.invalidJwt')

  return ok({ header, payload, signature })
}

const HMAC_ALGORITHMS: Record<string, string> = {
  HS256: 'SHA-256',
  HS384: 'SHA-384',
  HS512: 'SHA-512',
}

export type VerifyOutcome = 'valid' | 'invalid' | 'unsupported'

/**
 * Only the HMAC family can be checked here, because those are the algorithms
 * where the verifying key is the signing key. RS256 and friends verify with a
 * public key, which is safe to paste — but they need certificate parsing that
 * this tool deliberately does not carry.
 *
 * A token whose header says `alg: none` is reported invalid rather than valid:
 * accepting it is the classic JWT vulnerability.
 */
export async function verifyJwt(token: string, secret: string): Promise<Result<VerifyOutcome>> {
  const decoded = decodeJwt(token)
  if (!decoded.ok) return decoded
  if (secret === '') return err('error.emptyInput')

  const algorithm = String(decoded.value.header.alg ?? '').toUpperCase()
  if (algorithm === 'NONE') return ok('invalid')

  const hash = HMAC_ALGORITHMS[algorithm]
  if (!hash) return ok('unsupported')

  const [headerPart, payloadPart] = token.trim().split('.')
  const signed = `${headerPart}.${payloadPart}`

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash },
    false,
    ['sign'],
  )

  const expected = new Uint8Array(
    await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(signed)),
  )

  let binary = ''
  for (const byte of expected) binary += String.fromCharCode(byte)
  const encoded = btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '')

  return ok(encoded === decoded.value.signature ? 'valid' : 'invalid')
}

/** Reads a numeric claim such as `exp`, `iat` or `nbf` as a Date. */
export function claimAsDate(payload: Record<string, unknown>, claim: string): Date | null {
  const value = payload[claim]
  if (typeof value !== 'number' || !Number.isFinite(value)) return null

  return new Date(value * 1000)
}
