import { err, ok, type Result } from '../result.js'

/**
 * `btoa` and `atob` only understand bytes, so anything outside Latin-1 (Turkish,
 * Japanese, emoji...) has to be converted to UTF-8 first. Skipping this step is
 * why many online base64 tools quietly corrupt non-English text.
 */

export function encodeBase64(input: string): Result<string> {
  const bytes = new TextEncoder().encode(input)
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return ok(btoa(binary))
}

export function decodeBase64(input: string): Result<string> {
  const trimmed = input.trim()
  if (trimmed === '') return err('error.emptyInput')

  let bytes: Uint8Array
  try {
    bytes = Uint8Array.from(atob(trimmed), (char) => char.charCodeAt(0))
  } catch {
    return err('error.invalidBase64')
  }

  // `fatal` turns malformed UTF-8 into an exception instead of silent U+FFFD
  // replacement characters, so we can tell the user the input was not text.
  try {
    return ok(new TextDecoder('utf-8', { fatal: true }).decode(bytes))
  } catch {
    return err('error.invalidUtf8')
  }
}

/** URL-safe variant (RFC 4648 §5): `+/` become `-_` and padding is dropped. */
export function encodeBase64Url(input: string): Result<string> {
  const encoded = encodeBase64(input)
  if (!encoded.ok) return encoded

  return ok(encoded.value.replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, ''))
}

export function decodeBase64Url(input: string): Result<string> {
  const restored = input.trim().replaceAll('-', '+').replaceAll('_', '/')
  const padding = (4 - (restored.length % 4)) % 4
  return decodeBase64(restored + '='.repeat(padding))
}
