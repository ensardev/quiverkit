const HEX_GROUPS = [8, 12, 16, 20] as const

function formatUuid(bytes: Uint8Array): string {
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
  const [a, b, c, d] = HEX_GROUPS
  return `${hex.slice(0, a)}-${hex.slice(a, b)}-${hex.slice(b, c)}-${hex.slice(c, d)}-${hex.slice(d)}`
}

export function generateUuidV4(): string {
  return crypto.randomUUID()
}

let lastTimestamp = 0
let sequence = 0

/**
 * UUID v7 (RFC 9562): a 48-bit millisecond timestamp followed by randomness, so
 * generated ids sort chronologically. That makes them far friendlier than v4 as
 * database primary keys, where random ids scatter B-tree inserts.
 *
 * The timestamp alone is not enough: ids minted within the same millisecond
 * would fall back to comparing random bits and lose their order. So we spend the
 * 12 bits after the version field on a counter, as described in RFC 9562 §6.2
 * "method 1". The remaining 62 bits stay random, which is what keeps ids
 * unguessable and collision-free.
 *
 * We write through a DataView rather than indexing the array directly, because
 * `setUint8`/`getUint8` return plain numbers under `noUncheckedIndexedAccess`.
 */
export function generateUuidV7(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16))
  const view = new DataView(bytes.buffer)
  const now = Date.now()

  if (now === lastTimestamp) {
    // 12 bits hold 4096 ids per millisecond, far beyond what a browser tool
    // needs; wrapping only costs ordering, never uniqueness.
    sequence = (sequence + 1) & 0x0fff
  } else {
    lastTimestamp = now
    sequence = 0
  }

  view.setUint16(0, Math.floor(now / 2 ** 32))
  view.setUint32(2, now >>> 0)
  view.setUint16(6, 0x7000 | sequence)
  view.setUint8(8, (view.getUint8(8) & 0x3f) | 0x80)

  return formatUuid(bytes)
}

export function generateNanoId(size = 21): string {
  const alphabet = 'useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict'
  const random = crypto.getRandomValues(new Uint8Array(size))
  return Array.from(random, (byte) => alphabet[byte % alphabet.length]).join('')
}
