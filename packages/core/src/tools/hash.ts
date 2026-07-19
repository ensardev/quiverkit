import { err, ok, type Result } from '../result.js'

/**
 * Only the algorithms the platform actually ships. MD5 is deliberately absent:
 * `crypto.subtle` refuses to implement it because it is broken for anything
 * security-related, and shipping our own would invite people to keep using it.
 */
export const HASH_ALGORITHMS = ['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'] as const

export type HashAlgorithm = (typeof HASH_ALGORITHMS)[number]

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

export async function hashText(
  input: string,
  algorithm: HashAlgorithm,
): Promise<Result<string>> {
  if (input === '') return err('error.emptyInput')

  const digest = await crypto.subtle.digest(algorithm, new TextEncoder().encode(input))
  return ok(toHex(digest))
}

/** Same digest for raw bytes — what a file checksum needs. */
export async function hashBytes(
  bytes: ArrayBuffer,
  algorithm: HashAlgorithm,
): Promise<Result<string>> {
  return ok(toHex(await crypto.subtle.digest(algorithm, bytes)))
}

export async function hmac(
  message: string,
  secret: string,
  algorithm: HashAlgorithm,
): Promise<Result<string>> {
  if (message === '') return err('error.emptyInput')

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: algorithm },
    false,
    ['sign'],
  )

  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message))
  return ok(toHex(signature))
}
