import { err, ok, type Result } from '../result.js'

export const KEY_ALGORITHMS = ['RSA-2048', 'RSA-4096', 'ECDSA-P256', 'Ed25519'] as const

export type KeyAlgorithm = (typeof KEY_ALGORITHMS)[number]

export interface KeyPairPem {
  publicKey: string
  privateKey: string
}

const PARAMETERS: Record<KeyAlgorithm, { params: EcKeyGenParams | RsaHashedKeyGenParams | Algorithm; usages: KeyUsage[] }> = {
  'RSA-2048': {
    params: {
      name: 'RSASSA-PKCS1-v1_5',
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: 'SHA-256',
    },
    usages: ['sign', 'verify'],
  },
  'RSA-4096': {
    params: {
      name: 'RSASSA-PKCS1-v1_5',
      modulusLength: 4096,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: 'SHA-256',
    },
    usages: ['sign', 'verify'],
  },
  'ECDSA-P256': {
    params: { name: 'ECDSA', namedCurve: 'P-256' },
    usages: ['sign', 'verify'],
  },
  Ed25519: {
    params: { name: 'Ed25519' },
    usages: ['sign', 'verify'],
  },
}

/** PEM is base64 in 64-character lines, wrapped in the matching header. */
function toPem(buffer: ArrayBuffer, label: string): string {
  let binary = ''
  for (const byte of new Uint8Array(buffer)) binary += String.fromCharCode(byte)

  const body = btoa(binary).replace(/(.{64})/g, '$1\n').trimEnd()
  return `-----BEGIN ${label}-----\n${body}\n-----END ${label}-----`
}

export async function generateKeyPair(algorithm: KeyAlgorithm): Promise<Result<KeyPairPem>> {
  const entry = PARAMETERS[algorithm]

  try {
    // Ed25519 reached browsers late, so an older one may reject it outright.
    const pair = (await crypto.subtle.generateKey(entry.params, true, entry.usages)) as CryptoKeyPair

    const [publicKey, privateKey] = await Promise.all([
      crypto.subtle.exportKey('spki', pair.publicKey),
      crypto.subtle.exportKey('pkcs8', pair.privateKey),
    ])

    return ok({
      publicKey: toPem(publicKey, 'PUBLIC KEY'),
      privateKey: toPem(privateKey, 'PRIVATE KEY'),
    })
  } catch {
    return err('error.keyGenerationFailed')
  }
}
