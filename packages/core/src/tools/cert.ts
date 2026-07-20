import { err, ok, type Result } from '../result.js'

export interface CertInfo {
  subject: Record<string, string>
  issuer: Record<string, string>
  notBefore: Date
  notAfter: Date
  serialNumber: string
  /** Hex fingerprint of the DER certificate. */
  fingerprintSha1: string
  fingerprintSha256: string
  signatureAlgorithm: string
  publicKeyAlgorithm: string
  publicKeyBits: number
  /** SAN DNS entries, if any. */
  subjectAltNames: string[]
}

// ASN.1 DER universal tags
const TAG = {
  BOOLEAN: 0x01,
  INTEGER: 0x02,
  BIT_STRING: 0x03,
  OCTET_STRING: 0x04,
  NULL: 0x05,
  OID: 0x06,
  UTF8_STRING: 0x0c,
  PRINTABLE_STRING: 0x13,
  IA5_STRING: 0x16,
  UTC_TIME: 0x17,
  GENERALIZED_TIME: 0x18,
  SEQUENCE: 0x30,
  SET: 0x31,
} as const

interface DerNode {
  tag: number
  value: Uint8Array
  children: DerNode[]
}

// Common OIDs
const OID = {
  CN: '2.5.4.3',
  SURNAME: '2.5.4.4',
  SERIAL_NUMBER: '2.5.4.5',
  C: '2.5.4.6',
  L: '2.5.4.7',
  ST: '2.5.4.8',
  STREET: '2.5.4.9',
  O: '2.5.4.10',
  OU: '2.5.4.11',
  EMAIL: '1.2.840.113549.1.9.1',
  SAN: '2.5.29.17',
  RSA: '1.2.840.113549.1.1.1',
  ECDSA_P256: '1.2.840.10045.3.1.7',
  ECDSA_P384: '1.3.132.0.34',
  ECDSA_P521: '1.3.132.0.35',
  ED25519: '1.3.101.112',
  SHA256_WITH_RSA: '1.2.840.113549.1.1.11',
  SHA384_WITH_RSA: '1.2.840.113549.1.1.12',
  SHA512_WITH_RSA: '1.2.840.113549.1.1.13',
  ECDSA_WITH_SHA256: '1.2.840.10045.4.3.2',
  ECDSA_WITH_SHA384: '1.2.840.10045.4.3.3',
  ECDSA_WITH_SHA512: '1.2.840.10045.4.3.4',
} as const

const OID_LABELS: Record<string, string> = {
  [OID.CN]: 'CN',
  [OID.SURNAME]: 'SN',
  [OID.SERIAL_NUMBER]: 'serialNumber',
  [OID.C]: 'C',
  [OID.L]: 'L',
  [OID.ST]: 'ST',
  [OID.STREET]: 'street',
  [OID.O]: 'O',
  [OID.OU]: 'OU',
  [OID.EMAIL]: 'email',
}

const SIG_ALGS: Record<string, string> = {
  [OID.SHA256_WITH_RSA]: 'SHA-256 with RSA',
  [OID.SHA384_WITH_RSA]: 'SHA-384 with RSA',
  [OID.SHA512_WITH_RSA]: 'SHA-512 with RSA',
  [OID.ECDSA_WITH_SHA256]: 'ECDSA with SHA-256',
  [OID.ECDSA_WITH_SHA384]: 'ECDSA with SHA-384',
  [OID.ECDSA_WITH_SHA512]: 'ECDSA with SHA-512',
}

const KEY_ALGS: Record<string, string> = {
  [OID.RSA]: 'RSA',
  [OID.ECDSA_P256]: 'ECDSA P-256',
  [OID.ECDSA_P384]: 'ECDSA P-384',
  [OID.ECDSA_P521]: 'ECDSA P-521',
  [OID.ED25519]: 'Ed25519',
}

/** Decodes a PEM or DER X.509 certificate. */
export async function decodeCertificate(input: string): Promise<Result<CertInfo>> {
  const trimmed = input.trim()
  if (trimmed === '') return err('error.emptyInput')

  let der: Uint8Array

  if (trimmed.startsWith('-----BEGIN CERTIFICATE-----')) {
    const b64 = trimmed
      .replace(/-----(BEGIN|END) CERTIFICATE-----/g, '')
      .replace(/\s/g, '')

    // DER is binary, so we can't use decodeBase64 — it rejects non-UTF-8 bytes.
    try {
      der = base64ToBytes(b64)
    } catch {
      return err('error.invalidCertificate')
    }
  } else if (trimmed.startsWith('-----BEGIN')) {
    return err('error.invalidCertificate')
  } else {
    // Try raw base64 first, fall back to hex DER.
    try {
      der = base64ToBytes(trimmed)
    } catch {
      // Try hex
      try {
        der = new Uint8Array(trimmed.length / 2)
        for (let i = 0; i < trimmed.length; i += 2) {
          der[i / 2] = parseInt(trimmed.substring(i, i + 2), 16)
        }
      } catch {
        return err('error.invalidCertificate')
      }
    }
  }

  try {
    const tree = parseDer(der)
    if (tree.length === 0) return err('error.invalidCertificate')
    const cert = tree[0] as DerNode

    // Certificate is a SEQUENCE with 3 children.
    if (cert.tag !== TAG.SEQUENCE || cert.children.length < 3) return err('error.invalidCertificate')
    const tbsCert = cert.children[0]
    if (tbsCert === undefined || tbsCert.tag !== TAG.SEQUENCE) return err('error.invalidCertificate')

    // Compute fingerprints over the raw DER.
    const sha1 = await crypto.subtle.digest('SHA-1', der.buffer as ArrayBuffer)
    const sha256 = await crypto.subtle.digest('SHA-256', der.buffer as ArrayBuffer)
    const fp1 = Array.from(new Uint8Array(sha1)).map((b) => b.toString(16).padStart(2, '0')).join(':')
    const fp256 = Array.from(new Uint8Array(sha256)).map((b) => b.toString(16).padStart(2, '0')).join(':')

    // Walk TBSCertificate.
    // Structure: version[0]?, serialNumber, sigAlg, issuer, validity, subject, spki, ...
    let idx = 0
    const tbs = tbsCert.children

    // Skip version (context-specific [0]).
    if (idx < tbs.length && (tbs[idx] as DerNode).tag === 0xa0) idx++

    const serial = idx < tbs.length ? tbs[idx] : null
    idx++
    const sigAlgNode = idx < tbs.length ? tbs[idx] : null
    idx++

    const issuer = extractRdn(idx < tbs.length ? tbs[idx] : null)
    idx++
    const validity = idx < tbs.length ? tbs[idx] : null
    idx++
    const subject = extractRdn(idx < tbs.length ? tbs[idx] : null)

    // Parse validity.
    const [notBefore, notAfter] = extractValidity(validity)

    // Parse serial number.
    const serialStr = extractSerial(serial)

    // Extract extensions for SAN.  Walk past spki to find extensions (tag [3]).
    idx++ // spki
    const sanNames: string[] = []
    for (let i = idx; i < tbs.length; i++) {
      const node = tbs[i]
      if (node === undefined) continue
      if (node.tag === 0xa3) {
        // Extensions — a SEQUENCE of SEQUENCE { OID, critical?, value }
        const extSeq = node.children[0]
        if (extSeq && extSeq.tag === TAG.SEQUENCE) {
          for (const ext of extSeq.children) {
            if (ext.tag !== TAG.SEQUENCE) continue
            const oidNode = ext.children[0]
            if (!oidNode) continue
            const oid = readOid(oidNode.value)
            if (oid !== OID.SAN) continue

            // SAN value is OCTET STRING wrapping a SEQUENCE.
            const extValue = ext.children[1]
            if (!extValue || extValue.tag !== TAG.OCTET_STRING) continue
            const wrapped = parseDer(extValue.value)
            if (wrapped.length === 0) continue
            const sanSeq = wrapped[0] as DerNode
            if (sanSeq.tag !== TAG.SEQUENCE) continue

            for (const san of sanSeq.children) {
              // Each entry is context-specific: [2] = dNSName
              if (san.tag === 0x82) {
                sanNames.push(new TextDecoder().decode(san.value))
              }
            }
          }
        }
      }
    }

    // Parse signature algorithm.
    const sigOid = extractSigAlgOid(sigAlgNode)
    const sigAlg = SIG_ALGS[sigOid] ?? sigOid

    // Parse public key info (spki).
    const spki = idx > 0 ? tbs[idx - 1] : null
    const [keyAlg, keyBits] = extractKeyInfo(spki)

    return ok({
      subject,
      issuer,
      notBefore,
      notAfter,
      serialNumber: serialStr,
      fingerprintSha1: fp1,
      fingerprintSha256: fp256,
      signatureAlgorithm: sigAlg,
      publicKeyAlgorithm: keyAlg,
      publicKeyBits: keyBits,
      subjectAltNames: sanNames,
    })
  } catch {
    return err('error.invalidCertificate')
  }
}

// -- DER parser -----------------------------------------------------------

function base64ToBytes(b64: string): Uint8Array {
  const binary = atob(b64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  if (bytes.length === 0) throw new Error('empty')
  return bytes
}

function parseDer(data: Uint8Array, offset = 0): DerNode[] {
  const nodes: DerNode[] = []
  let pos = offset

  while (pos < data.length) {
    if (pos >= data.length) break

    const tag = data[pos] as number
    pos++

    if (pos >= data.length) break
    let length = data[pos] as number
    pos++

    if (length >= 0x80) {
      const numBytes = length & 0x7f
      length = 0
      for (let i = 0; i < numBytes; i++) {
        length = (length << 8) | (data[pos] as number)
        pos++
      }
    }

    const value = data.slice(pos, pos + length)
    pos += length

    const children = isConstructed(tag) ? parseDer(value, 0) : []
    nodes.push({ tag, value, children })
  }

  return nodes
}

function isConstructed(tag: number): boolean {
  return (tag & 0x20) !== 0
}

// -- Helpers ----------------------------------------------------------------

function readOid(value: Uint8Array): string {
  const parts: number[] = []
  let i = 0
  if (i >= value.length) return ''
  parts.push(Math.floor(value[i]! / 40))
  parts.push(value[i]! % 40)
  i++
  while (i < value.length) {
    let n = 0
    while (i < value.length) {
      const b = value[i]!
      i++
      n = (n << 7) | (b & 0x7f)
      if ((b & 0x80) === 0) break
    }
    parts.push(n)
  }
  return parts.join('.')
}

function extractRdn(node: DerNode | null | undefined): Record<string, string> {
  const result: Record<string, string> = {}
  if (!node || node.tag !== TAG.SEQUENCE) return result

  for (const rdn of node.children) {
    if (rdn.tag !== TAG.SET) continue
    for (const attr of rdn.children) {
      if (attr.tag !== TAG.SEQUENCE) continue
      const oidNode = attr.children[0]
      const valNode = attr.children[1]
      if (!oidNode || !valNode) continue
      const key = OID_LABELS[readOid(oidNode.value)] ?? readOid(oidNode.value)
      result[key] = new TextDecoder().decode(valNode.value)
    }
  }

  return result
}

function extractValidity(node: DerNode | null | undefined): [Date, Date] {
  const epoch = new Date(0)
  if (!node || node.tag !== TAG.SEQUENCE || node.children.length < 2) return [epoch, epoch]

  return [parseTime(node.children[0]!), parseTime(node.children[1]!)]
}

function parseTime(node: DerNode): Date {
  const str = new TextDecoder().decode(node.value)
  // UTCTime: YYMMDDHHMMSSZ or YYMMDDHHMMZ
  // GeneralizedTime: YYYYMMDDHHMMSSZ
  if (node.tag === TAG.UTC_TIME) {
    const yy = parseInt(str.substring(0, 2), 10)
    const year = yy >= 50 ? 1900 + yy : 2000 + yy
    const month = parseInt(str.substring(2, 4), 10) - 1
    const day = parseInt(str.substring(4, 6), 10)
    const hour = parseInt(str.substring(6, 8), 10)
    const min = parseInt(str.substring(8, 10), 10)
    const sec = str.length >= 12 ? parseInt(str.substring(10, 12), 10) : 0
    return new Date(Date.UTC(year, month, day, hour, min, sec))
  }

  const year = parseInt(str.substring(0, 4), 10)
  const month = parseInt(str.substring(4, 6), 10) - 1
  const day = parseInt(str.substring(6, 8), 10)
  const hour = parseInt(str.substring(8, 10), 10)
  const min = parseInt(str.substring(10, 12), 10)
  const sec = str.length >= 14 ? parseInt(str.substring(12, 14), 10) : 0
  return new Date(Date.UTC(year, month, day, hour, min, sec))
}

function extractSerial(node: DerNode | null | undefined): string {
  if (!node || node.tag !== TAG.INTEGER) return ''
  const bytes = node.value
  // Strip leading zero pad.
  let start = 0
  while (start < bytes.length - 1 && bytes[start] === 0) start++
  return Array.from(bytes.slice(start))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join(':')
    .toUpperCase()
}

function extractSigAlgOid(node: DerNode | null | undefined): string {
  if (!node || node.tag !== TAG.SEQUENCE || node.children.length === 0) return ''
  const oidNode = node.children[0]
  if (!oidNode) return ''
  return readOid(oidNode.value)
}

function extractKeyInfo(node: DerNode | null | undefined): [string, number] {
  if (!node || node.tag !== TAG.SEQUENCE || node.children.length < 2) return ['Unknown', 0]

  const algNode = node.children[0]
  const keyNode = node.children[1]
  if (!algNode || !keyNode) return ['Unknown', 0]

  if (algNode.tag !== TAG.SEQUENCE || algNode.children.length === 0) return ['Unknown', 0]
  const oidNode = algNode.children[0]
  if (!oidNode) return ['Unknown', 0]

  const oid = readOid(oidNode.value)
  const name = KEY_ALGS[oid] ?? oid

  // Key size: for RSA, key size = modulus bits from the BIT STRING.
  // For EC, the OID itself tells us.
  if (oid === OID.RSA) {
    // The key is a BIT STRING whose payload is a SEQUENCE of two INTEGERs (n, e).
    let keyData = keyNode.value
    // BIT STRING has a leading unused-bits byte.
    if (keyNode.tag === TAG.BIT_STRING && keyData.length > 0) {
      keyData = keyData.slice(1)
    }
    try {
      const seq = parseDer(keyData)
      if (seq.length > 0) {
        const modNode = (seq[0] as DerNode).children[0]
        if (modNode && modNode.tag === TAG.INTEGER) {
          return [name, modNode.value.length * 8]
        }
      }
    } catch {
      // fall through
    }
    return [name, 0]
  }

  if (oid === OID.ECDSA_P256 || oid === OID.ED25519) return [name, 256]
  if (oid === OID.ECDSA_P384) return [name, 384]
  if (oid === OID.ECDSA_P521) return [name, 521]

  return [name, 0]
}
