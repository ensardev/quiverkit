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

/** Reads a numeric claim such as `exp`, `iat` or `nbf` as a Date. */
export function claimAsDate(payload: Record<string, unknown>, claim: string): Date | null {
  const value = payload[claim]
  if (typeof value !== 'number' || !Number.isFinite(value)) return null

  return new Date(value * 1000)
}
