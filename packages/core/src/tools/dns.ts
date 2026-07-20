import { err, ok, type Result } from '../result.js'

export const RECORD_TYPES = ['A', 'AAAA', 'CNAME', 'MX', 'TXT', 'NS', 'SOA', 'CAA'] as const

export type RecordType = (typeof RECORD_TYPES)[number]

export interface DnsRecord {
  name: string
  type: string
  ttl: number
  value: string
}

/**
 * The one tool here that cannot work offline: resolving a name means asking a
 * resolver. We build the DNS-over-HTTPS request and parse the reply, but the
 * request itself is made by the caller — core stays free of network access, and
 * the interface can warn before anything is sent.
 *
 * Whoever answers sees the domain being looked up. That is unavoidable, and the
 * reason this tool is marked as leaving the browser.
 */
export const RESOLVER = 'https://cloudflare-dns.com/dns-query'

export function buildQueryUrl(domain: string, type: RecordType): Result<string> {
  const trimmed = domain.trim().toLowerCase().replace(/^https?:\/\//, '').split('/')[0] ?? ''
  if (trimmed === '') return err('error.emptyInput')

  // A hostname is labels of letters, digits and hyphens separated by dots.
  if (!/^(?!-)[a-z0-9-]{1,63}(?<!-)(\.(?!-)[a-z0-9-]{1,63}(?<!-))+$/.test(trimmed)) {
    return err('error.invalidDomain')
  }

  const url = new URL(RESOLVER)
  url.searchParams.set('name', trimmed)
  url.searchParams.set('type', type)

  return ok(url.toString())
}

const TYPE_NAMES: Record<number, string> = {
  1: 'A', 2: 'NS', 5: 'CNAME', 6: 'SOA', 15: 'MX', 16: 'TXT', 28: 'AAAA', 257: 'CAA',
}

interface RawAnswer {
  name?: unknown
  type?: unknown
  TTL?: unknown
  data?: unknown
}

export function parseResponse(payload: unknown): Result<DnsRecord[]> {
  if (typeof payload !== 'object' || payload === null) return err('error.networkFailed')

  const body = payload as { Status?: unknown; Answer?: unknown }

  // Status 3 is NXDOMAIN: the name simply does not exist, which is an answer
  // rather than a failure.
  if (body.Status === 3) return ok([])
  if (typeof body.Status === 'number' && body.Status !== 0) return err('error.networkFailed')
  if (!Array.isArray(body.Answer)) return ok([])

  return ok(
    (body.Answer as RawAnswer[]).map((answer) => ({
      name: String(answer.name ?? '').replace(/\.$/, ''),
      type: TYPE_NAMES[Number(answer.type)] ?? String(answer.type ?? ''),
      ttl: Number(answer.TTL ?? 0),
      value: String(answer.data ?? '').replace(/^"|"$/g, ''),
    })),
  )
}

/** Turns a TTL into the largest sensible unit, the way dig output reads. */
export function describeTtl(seconds: number): { amount: number; unit: 'second' | 'minute' | 'hour' | 'day' } {
  if (seconds >= 86_400) return { amount: Math.round(seconds / 86_400), unit: 'day' }
  if (seconds >= 3_600) return { amount: Math.round(seconds / 3_600), unit: 'hour' }
  if (seconds >= 60) return { amount: Math.round(seconds / 60), unit: 'minute' }
  return { amount: seconds, unit: 'second' }
}
