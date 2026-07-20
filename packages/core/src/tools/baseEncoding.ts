import { err, ok, type Result } from '../result.js'

/** RFC 4648. No padding characters that look alike, which is why TOTP uses it. */
const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'

/** Bitcoin's alphabet: base64 minus 0, O, I, l and the two symbols. */
const BASE58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'

export function encodeBase32(bytes: Uint8Array): string {
  let output = ''
  let buffer = 0
  let bits = 0

  for (const byte of bytes) {
    buffer = (buffer << 8) | byte
    bits += 8

    while (bits >= 5) {
      output += BASE32_ALPHABET[(buffer >>> (bits - 5)) & 31]
      bits -= 5
    }
  }

  // Whatever is left over is padded on the right, not the left.
  if (bits > 0) output += BASE32_ALPHABET[(buffer << (5 - bits)) & 31]

  while (output.length % 8 !== 0) output += '='

  return output
}

// The buffer type is spelled out because Web Crypto refuses a Uint8Array whose
// backing store might be shared.
export function decodeBase32(input: string): Result<Uint8Array<ArrayBuffer>> {
  const cleaned = input.trim().toUpperCase().replace(/=+$/, '').replaceAll(' ', '')
  if (cleaned === '') return err('error.emptyInput')

  const bytes: number[] = []
  let buffer = 0
  let bits = 0

  for (const character of cleaned) {
    const value = BASE32_ALPHABET.indexOf(character)
    if (value < 0) return err('error.invalidBase32')

    buffer = (buffer << 5) | value
    bits += 5

    if (bits >= 8) {
      bytes.push((buffer >>> (bits - 8)) & 255)
      bits -= 8
    }
  }

  return ok(new Uint8Array(bytes))
}

/**
 * Base58 is a whole-number base change rather than a bit-packing, so it cannot
 * be streamed byte by byte the way base32 and base64 can. BigInt keeps long
 * inputs exact.
 */
export function encodeBase58(bytes: Uint8Array): string {
  if (bytes.length === 0) return ''

  let value = 0n
  for (const byte of bytes) value = value * 256n + BigInt(byte)

  let output = ''
  while (value > 0n) {
    output = (BASE58_ALPHABET[Number(value % 58n)] as string) + output
    value /= 58n
  }

  // Leading zero bytes carry no numeric weight, so they are re-added as '1'.
  for (const byte of bytes) {
    if (byte !== 0) break
    output = '1' + output
  }

  return output
}

export function decodeBase58(input: string): Result<Uint8Array<ArrayBuffer>> {
  const trimmed = input.trim()
  if (trimmed === '') return err('error.emptyInput')

  let value = 0n
  for (const character of trimmed) {
    const digit = BASE58_ALPHABET.indexOf(character)
    if (digit < 0) return err('error.invalidBase58')
    value = value * 58n + BigInt(digit)
  }

  const bytes: number[] = []
  while (value > 0n) {
    bytes.unshift(Number(value % 256n))
    value /= 256n
  }

  for (const character of trimmed) {
    if (character !== '1') break
    bytes.unshift(0)
  }

  return ok(new Uint8Array(bytes))
}

const encoder = new TextEncoder()

export function textToBase32(text: string): Result<string> {
  return text === '' ? err('error.emptyInput') : ok(encodeBase32(encoder.encode(text)))
}

export function base32ToText(input: string): Result<string> {
  const bytes = decodeBase32(input)
  if (!bytes.ok) return bytes

  try {
    return ok(new TextDecoder('utf-8', { fatal: true }).decode(bytes.value))
  } catch {
    return err('error.invalidUtf8')
  }
}

export function textToBase58(text: string): Result<string> {
  return text === '' ? err('error.emptyInput') : ok(encodeBase58(encoder.encode(text)))
}

export function base58ToText(input: string): Result<string> {
  const bytes = decodeBase58(input)
  if (!bytes.ok) return bytes

  try {
    return ok(new TextDecoder('utf-8', { fatal: true }).decode(bytes.value))
  } catch {
    return err('error.invalidUtf8')
  }
}
