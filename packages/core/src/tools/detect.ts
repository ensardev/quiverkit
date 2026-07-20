/**
 * Works out what a pasted blob is, so the user does not have to pick a tool
 * first. Every check reuses the same parsers the tools themselves use, which is
 * why this arrived last: it is only as good as what is already here.
 */

export type DetectionKind =
  | 'jwt'
  | 'pem'
  | 'uuid'
  | 'json'
  | 'url'
  | 'email'
  | 'ipv4'
  | 'cidr'
  | 'semver'
  | 'cron'
  | 'colour'
  | 'unixSeconds'
  | 'unixMillis'
  | 'isoDate'
  | 'md5'
  | 'sha1'
  | 'sha256'
  | 'sha512'
  | 'base64'
  | 'base32'
  | 'hex'
  | 'punycode'
  | 'htmlEntities'
  | 'urlEncoded'

export interface Detection {
  kind: DetectionKind
  /** 0–1. Ordering is by this, so the most specific reading comes first. */
  confidence: number
  /** Registry id of the tool that handles it. */
  tool: string
  /** A short, already-decoded glimpse — the reason this is worth a look. */
  preview?: string
}

const HEX_LENGTHS: Record<number, { kind: DetectionKind; tool: string }> = {
  32: { kind: 'md5', tool: 'hash' },
  40: { kind: 'sha1', tool: 'hash' },
  64: { kind: 'sha256', tool: 'hash' },
  128: { kind: 'sha512', tool: 'hash' },
}

function decodeBase64Url(segment: string): string | null {
  const restored = segment.replaceAll('-', '+').replaceAll('_', '/')
  const padded = restored + '='.repeat((4 - (restored.length % 4)) % 4)

  try {
    const binary = atob(padded)
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0))
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes)
  } catch {
    return null
  }
}

function shorten(text: string, limit = 90): string {
  const flat = text.replace(/\s+/g, ' ').trim()
  return flat.length > limit ? flat.slice(0, limit) + '…' : flat
}

function detectJwt(input: string): Detection | null {
  const parts = input.split('.')
  if (parts.length !== 3) return null

  const header = decodeBase64Url(parts[0] as string)
  const payload = decodeBase64Url(parts[1] as string)
  if (!header || !payload) return null

  try {
    const parsedHeader = JSON.parse(header) as { alg?: unknown }
    const parsedPayload = JSON.parse(payload) as Record<string, unknown>
    if (typeof parsedHeader.alg !== 'string') return null

    const subject = parsedPayload.sub ?? parsedPayload.name ?? parsedPayload.email
    return {
      kind: 'jwt',
      confidence: 1,
      tool: 'jwt',
      preview: `${parsedHeader.alg}${subject === undefined ? '' : ` · ${String(subject)}`}`,
    }
  } catch {
    return null
  }
}

function detectDate(input: string): Detection | null {
  if (!/^\d{9,13}$/.test(input)) return null

  const numeric = Number(input)
  // Ten digits is seconds, thirteen is milliseconds; both land in a plausible
  // range only for one of the two readings, which is what makes this safe.
  const asSeconds = new Date(numeric * 1000)
  const asMillis = new Date(numeric)
  const plausible = (date: Date) => date.getFullYear() > 1990 && date.getFullYear() < 2100

  if (input.length <= 10 && plausible(asSeconds)) {
    return { kind: 'unixSeconds', confidence: 0.85, tool: 'timestamp', preview: asSeconds.toISOString() }
  }
  if (plausible(asMillis)) {
    return { kind: 'unixMillis', confidence: 0.85, tool: 'timestamp', preview: asMillis.toISOString() }
  }

  return null
}

function detectBase64(input: string): Detection | null {
  if (input.length < 8 || input.length % 4 !== 0) return null
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(input)) return null

  try {
    const binary = atob(input)
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0))
    const text = new TextDecoder('utf-8', { fatal: true }).decode(bytes)

    // Decoding to control characters means it was binary, not text — still
    // base64, just less certain that the user wanted it read as a string.
    const printable = [...text].every((character) => character >= ' ' || character === '\n')

    return {
      kind: 'base64',
      confidence: printable ? 0.8 : 0.5,
      tool: 'base64',
      preview: printable ? shorten(text) : undefined,
    }
  } catch {
    return { kind: 'base64', confidence: 0.4, tool: 'base64' }
  }
}

export function detect(raw: string): Detection[] {
  const input = raw.trim()
  if (input === '') return []

  const found: Detection[] = []
  const push = (detection: Detection | null) => {
    if (detection) found.push(detection)
  }

  push(detectJwt(input))

  if (/^-----BEGIN [A-Z0-9 ]+-----/.test(input)) {
    const label = /^-----BEGIN ([A-Z0-9 ]+)-----/.exec(input)?.[1] ?? ''
    found.push({
      kind: 'pem',
      confidence: 1,
      tool: label.includes('CERTIFICATE') ? 'cert' : 'keypair',
      preview: label,
    })
  }

  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(input)) {
    const version = input[14]
    found.push({ kind: 'uuid', confidence: 1, tool: 'uuid', preview: `v${version}` })
  }

  if (/^[{[]/.test(input)) {
    try {
      const parsed: unknown = JSON.parse(input)
      found.push({
        kind: 'json',
        confidence: 1,
        tool: 'json',
        preview: Array.isArray(parsed)
          ? `${parsed.length} items`
          : `${Object.keys(parsed as object).length} keys`,
      })
    } catch {
      // Looks like JSON but will not parse — the formatter is still the right
      // place to send someone, it will show them where it breaks.
      found.push({ kind: 'json', confidence: 0.4, tool: 'json' })
    }
  }

  if (/^https?:\/\/\S+$/i.test(input)) {
    try {
      const url = new URL(input)
      found.push({ kind: 'url', confidence: 1, tool: 'url', preview: url.hostname })
    } catch {
      /* not a URL after all */
    }
  }

  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input)) {
    found.push({ kind: 'email', confidence: 0.9, tool: 'punycode' })
  }

  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(input)) {
    const octets = input.split('.').map(Number)
    if (octets.every((octet) => octet <= 255)) {
      found.push({ kind: 'ipv4', confidence: 1, tool: 'cidr' })
    }
  }

  if (/^(\d{1,3}\.){3}\d{1,3}\/\d{1,2}$/.test(input)) {
    found.push({ kind: 'cidr', confidence: 1, tool: 'cidr' })
  }

  if (/^v?\d+\.\d+\.\d+(-[0-9a-z.-]+)?(\+[0-9a-z.-]+)?$/i.test(input)) {
    found.push({ kind: 'semver', confidence: 0.95, tool: 'semver' })
  }

  if (/^(\S+\s+){4}\S+$/.test(input) && /[*\/,-]|^\d/.test(input)) {
    found.push({ kind: 'cron', confidence: 0.7, tool: 'cron' })
  }

  if (/^#?([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(input) && input.startsWith('#')) {
    found.push({ kind: 'colour', confidence: 1, tool: 'color' })
  } else if (/^(rgb|hsl|oklch)a?\(/i.test(input)) {
    found.push({ kind: 'colour', confidence: 1, tool: 'color' })
  }

  push(detectDate(input))

  if (/^\d{4}-\d{2}-\d{2}([T ]\d{2}:\d{2})/.test(input)) {
    const date = new Date(input)
    if (!Number.isNaN(date.getTime())) {
      found.push({ kind: 'isoDate', confidence: 0.95, tool: 'timestamp', preview: date.toUTCString() })
    }
  }

  if (/^[0-9a-f]+$/i.test(input)) {
    const known = HEX_LENGTHS[input.length]
    if (known) {
      found.push({ ...known, confidence: 0.9 })
    } else if (input.length % 2 === 0 && input.length >= 8) {
      found.push({ kind: 'hex', confidence: 0.5, tool: 'hex' })
    }
  }

  push(detectBase64(input))

  if (/^[A-Z2-7]+=*$/.test(input) && input.length >= 8) {
    found.push({ kind: 'base32', confidence: 0.6, tool: 'baseEncoding' })
  }

  if (/(^|\.)xn--/i.test(input)) {
    found.push({ kind: 'punycode', confidence: 1, tool: 'punycode' })
  }

  if (/&(#x?[0-9a-f]+|[a-z]+);/i.test(input)) {
    found.push({ kind: 'htmlEntities', confidence: 0.8, tool: 'escape' })
  }

  if (/%[0-9a-f]{2}/i.test(input)) {
    try {
      const decoded = decodeURIComponent(input)
      if (decoded !== input) {
        found.push({ kind: 'urlEncoded', confidence: 0.8, tool: 'url', preview: shorten(decoded) })
      }
    } catch {
      /* malformed escapes — the URL tool will say so */
    }
  }

  return found.sort((left, right) => right.confidence - left.confidence)
}
