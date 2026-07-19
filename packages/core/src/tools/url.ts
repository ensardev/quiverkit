import { err, ok, type Result } from '../result.js'

/** Escapes everything unsafe, including `/` `?` `&` `=` — use for values. */
export function encodeUrlComponent(input: string): Result<string> {
  return ok(encodeURIComponent(input))
}

export function decodeUrlComponent(input: string): Result<string> {
  if (input.trim() === '') return err('error.emptyInput')

  try {
    return ok(decodeURIComponent(input))
  } catch {
    // Thrown by lone or truncated percent escapes such as "%" or "%E0%A4".
    return err('error.invalidUrlEncoding')
  }
}

/** Keeps reserved characters intact — use when escaping a whole URL. */
export function encodeUrl(input: string): Result<string> {
  return ok(encodeURI(input))
}

export function decodeUrl(input: string): Result<string> {
  if (input.trim() === '') return err('error.emptyInput')

  try {
    return ok(decodeURI(input))
  } catch {
    return err('error.invalidUrlEncoding')
  }
}

export interface ParsedUrl {
  protocol: string
  host: string
  port: string
  path: string
  hash: string
  params: { key: string; value: string }[]
}

export function parseUrl(input: string): Result<ParsedUrl> {
  const trimmed = input.trim()
  if (trimmed === '') return err('error.emptyInput')

  let url: URL
  try {
    url = new URL(trimmed)
  } catch {
    return err('error.invalidUrlEncoding')
  }

  return ok({
    protocol: url.protocol.replace(':', ''),
    host: url.hostname,
    port: url.port,
    path: url.pathname,
    hash: url.hash,
    params: [...url.searchParams].map(([key, value]) => ({ key, value })),
  })
}
