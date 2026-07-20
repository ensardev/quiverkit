import { err, ok, type Result } from '../result.js'
import { decodeBase32 } from './baseEncoding.js'

export const TOTP_ALGORITHMS = ['SHA-1', 'SHA-256', 'SHA-512'] as const

export type TotpAlgorithm = (typeof TOTP_ALGORITHMS)[number]

export interface TotpOptions {
  /** Base32, exactly as an authenticator app prints it. */
  secret: string
  digits: number
  period: number
  algorithm: TotpAlgorithm
}

export const DEFAULT_TOTP: TotpOptions = {
  secret: '',
  digits: 6,
  period: 30,
  algorithm: 'SHA-1',
}

export interface TotpCode {
  code: string
  /** Seconds until this code expires, which the UI counts down. */
  remaining: number
}

/**
 * RFC 6238. The counter is the number of whole periods since the epoch, written
 * as a big-endian 64-bit integer — the one detail people get wrong, because a
 * 32-bit write silently drops the high half and every code comes out different.
 */
function counterBytes(counter: number): Uint8Array<ArrayBuffer> {
  const bytes = new Uint8Array(8)
  const view = new DataView(bytes.buffer)

  view.setUint32(0, Math.floor(counter / 2 ** 32))
  view.setUint32(4, counter >>> 0)

  return bytes
}

export async function generateTotp(
  options: TotpOptions,
  at: Date = new Date(),
): Promise<Result<TotpCode>> {
  if (options.secret.trim() === '') return err('error.emptyInput')
  if (options.period <= 0 || options.digits < 6 || options.digits > 10) {
    return err('error.invalidSecret')
  }

  const secret = decodeBase32(options.secret)
  if (!secret.ok) return err('error.invalidSecret')
  if (secret.value.length === 0) return err('error.invalidSecret')

  const seconds = Math.floor(at.getTime() / 1000)
  const counter = Math.floor(seconds / options.period)

  const key = await crypto.subtle.importKey(
    'raw',
    secret.value,
    { name: 'HMAC', hash: options.algorithm },
    false,
    ['sign'],
  )

  const signature = new Uint8Array(
    await crypto.subtle.sign('HMAC', key, counterBytes(counter)),
  )

  // Dynamic truncation: the low nibble of the last byte picks where to read
  // four bytes from, so the code depends on the whole digest, not just its tail.
  const offset = (signature[signature.length - 1] as number) & 0x0f
  const binary =
    (((signature[offset] as number) & 0x7f) << 24) |
    ((signature[offset + 1] as number) << 16) |
    ((signature[offset + 2] as number) << 8) |
    (signature[offset + 3] as number)

  return ok({
    code: String(binary % 10 ** options.digits).padStart(options.digits, '0'),
    remaining: options.period - (seconds % options.period),
  })
}

export interface OtpUri {
  secret: string
  label: string
  issuer: string
  digits: number
  period: number
  algorithm: TotpAlgorithm
}

/** Reads the `otpauth://` string encoded in the QR code apps show you. */
export function parseOtpUri(uri: string): Result<OtpUri> {
  const trimmed = uri.trim()
  if (trimmed === '') return err('error.emptyInput')

  let url: URL
  try {
    url = new URL(trimmed)
  } catch {
    return err('error.invalidSecret')
  }

  if (url.protocol !== 'otpauth:') return err('error.invalidSecret')

  const secret = url.searchParams.get('secret')
  if (!secret) return err('error.invalidSecret')

  const label = decodeURIComponent(url.pathname.replace(/^\/+/, ''))
  const algorithm = (url.searchParams.get('algorithm') ?? 'SHA1').toUpperCase()

  return ok({
    secret,
    label,
    issuer: url.searchParams.get('issuer') ?? label.split(':')[0] ?? '',
    digits: Number(url.searchParams.get('digits') ?? 6),
    period: Number(url.searchParams.get('period') ?? 30),
    algorithm: (['SHA-1', 'SHA-256', 'SHA-512'] as const).find(
      (name) => name.replace('-', '') === algorithm,
    ) ?? 'SHA-1',
  })
}
