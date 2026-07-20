import { err, ok, type Result } from '../result.js'

// RFC 3492 constants.
const BASE = 36
const T_MIN = 1
const T_MAX = 26
const SKEW = 38
const DAMP = 700
const INITIAL_BIAS = 72
const INITIAL_N = 128
const DELIMITER = '-'
const PREFIX = 'xn--'

function digitToChar(digit: number): string {
  // 0–25 map to a–z, 26–35 to 0–9.
  return String.fromCharCode(digit + (digit < 26 ? 97 : 22))
}

function charToDigit(character: string): number {
  const code = character.charCodeAt(0)
  if (code >= 48 && code <= 57) return code - 22
  if (code >= 97 && code <= 122) return code - 97
  if (code >= 65 && code <= 90) return code - 65
  return BASE
}

function adaptBias(delta: number, count: number, first: boolean): number {
  let value = first ? Math.floor(delta / DAMP) : delta >> 1
  value += Math.floor(value / count)

  let k = 0
  while (value > ((BASE - T_MIN) * T_MAX) >> 1) {
    value = Math.floor(value / (BASE - T_MIN))
    k += BASE
  }

  return k + Math.floor(((BASE - T_MIN + 1) * value) / (value + SKEW))
}

function encodeLabel(label: string): Result<string> {
  const codePoints = [...label].map((character) => character.codePointAt(0) as number)
  const basic = codePoints.filter((point) => point < INITIAL_N)

  if (basic.length === codePoints.length) return ok(label)

  let output = basic.map((point) => String.fromCodePoint(point)).join('')
  let handled = basic.length
  if (handled > 0) output += DELIMITER

  let n = INITIAL_N
  let delta = 0
  let bias = INITIAL_BIAS

  while (handled < codePoints.length) {
    const next = Math.min(...codePoints.filter((point) => point >= n))
    delta += (next - n) * (handled + 1)
    n = next

    for (const point of codePoints) {
      if (point < n) delta += 1
      if (point !== n) continue

      let q = delta
      for (let k = BASE; ; k += BASE) {
        const t = k <= bias ? T_MIN : k >= bias + T_MAX ? T_MAX : k - bias
        if (q < t) break
        output += digitToChar(t + ((q - t) % (BASE - t)))
        q = Math.floor((q - t) / (BASE - t))
      }

      output += digitToChar(q)
      bias = adaptBias(delta, handled + 1, handled === basic.length)
      delta = 0
      handled += 1
    }

    delta += 1
    n += 1
  }

  return ok(PREFIX + output)
}

function decodeLabel(label: string): Result<string> {
  if (!label.toLowerCase().startsWith(PREFIX)) return ok(label)

  const body = label.slice(PREFIX.length)
  const lastDelimiter = body.lastIndexOf(DELIMITER)
  const output = [...body.slice(0, Math.max(0, lastDelimiter))].map(
    (character) => character.codePointAt(0) as number,
  )

  let index = 0
  let n = INITIAL_N
  let bias = INITIAL_BIAS
  let at = lastDelimiter < 0 ? 0 : lastDelimiter + 1

  while (at < body.length) {
    const previous = index
    let w = 1

    for (let k = BASE; ; k += BASE) {
      if (at >= body.length) return err('error.invalidDomain')

      const digit = charToDigit(body[at++] as string)
      if (digit >= BASE) return err('error.invalidDomain')

      index += digit * w
      const t = k <= bias ? T_MIN : k >= bias + T_MAX ? T_MAX : k - bias
      if (digit < t) break
      w *= BASE - t
    }

    bias = adaptBias(index - previous, output.length + 1, previous === 0)
    n += Math.floor(index / (output.length + 1))
    index %= output.length + 1
    output.splice(index, 0, n)
    index += 1
  }

  return ok(output.map((point) => String.fromCodePoint(point)).join(''))
}

/** Applies the conversion label by label, since a dot is never encoded. */
function perLabel(domain: string, convert: (label: string) => Result<string>): Result<string> {
  const trimmed = domain.trim()
  if (trimmed === '') return err('error.emptyInput')

  const labels: string[] = []
  for (const label of trimmed.split('.')) {
    const converted = convert(label)
    if (!converted.ok) return converted
    labels.push(converted.value)
  }

  return ok(labels.join('.'))
}

export function toPunycode(domain: string): Result<string> {
  return perLabel(domain.toLowerCase(), encodeLabel)
}

export function fromPunycode(domain: string): Result<string> {
  return perLabel(domain, decodeLabel)
}
