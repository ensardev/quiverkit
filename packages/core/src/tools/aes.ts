import { err, ok, type Result } from '../result.js'

const SALT_BYTES = 16
const IV_BYTES = 12
const ITERATIONS = 250_000

function toBase64(bytes: Uint8Array): string {
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary)
}

function fromBase64(value: string): Uint8Array<ArrayBuffer> | null {
  try {
    return Uint8Array.from(atob(value.trim()), (character) => character.charCodeAt(0))
  } catch {
    return null
  }
}

/**
 * A passphrase is not a key: it is short, low-entropy and human-chosen. PBKDF2
 * stretches it into one, and the iteration count is what makes guessing slow.
 * The salt is random per message so the same passphrase never derives the same
 * key twice.
 */
async function deriveKey(passphrase: string, salt: Uint8Array<ArrayBuffer>): Promise<CryptoKey> {
  const material = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(passphrase),
    'PBKDF2',
    false,
    ['deriveKey'],
  )

  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: ITERATIONS, hash: 'SHA-256' },
    material,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  )
}

/**
 * AES-GCM rather than AES-CBC: it authenticates as well as encrypts, so a
 * tampered message fails to decrypt instead of quietly producing garbage.
 * Salt and IV are stored alongside the ciphertext — neither is secret.
 */
export async function encryptAes(plaintext: string, passphrase: string): Promise<Result<string>> {
  if (plaintext === '') return err('error.emptyInput')
  if (passphrase === '') return err('error.emptyInput')

  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES))
  const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES))
  const key = await deriveKey(passphrase, salt)

  const ciphertext = new Uint8Array(
    await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(plaintext)),
  )

  const payload = new Uint8Array(salt.length + iv.length + ciphertext.length)
  payload.set(salt, 0)
  payload.set(iv, salt.length)
  payload.set(ciphertext, salt.length + iv.length)

  return ok(toBase64(payload))
}

export async function decryptAes(payload: string, passphrase: string): Promise<Result<string>> {
  if (payload.trim() === '') return err('error.emptyInput')

  const bytes = fromBase64(payload)
  if (!bytes || bytes.length <= SALT_BYTES + IV_BYTES) return err('error.decryptFailed')

  const salt = bytes.slice(0, SALT_BYTES)
  const iv = bytes.slice(SALT_BYTES, SALT_BYTES + IV_BYTES)
  const ciphertext = bytes.slice(SALT_BYTES + IV_BYTES)

  try {
    const key = await deriveKey(passphrase, salt)
    const plaintext = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext)
    return ok(new TextDecoder().decode(plaintext))
  } catch {
    // A wrong passphrase and a tampered message are indistinguishable here, and
    // that is the point: GCM refuses both rather than guessing.
    return err('error.decryptFailed')
  }
}
