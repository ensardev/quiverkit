import { err, ok, type Result } from '../result.js'

export interface CidrInfo {
  address: string
  prefix: number
  netmask: string
  wildcard: string
  network: string
  broadcast: string
  firstHost: string
  lastHost: string
  totalAddresses: number
  usableHosts: number
  isPrivate: boolean
}

function toNumber(address: string): number | null {
  const parts = address.split('.')
  if (parts.length !== 4) return null

  let value = 0
  for (const part of parts) {
    if (!/^\d{1,3}$/.test(part)) return null
    const octet = Number(part)
    if (octet > 255) return null
    value = value * 256 + octet
  }

  return value
}

/** `>>> 0` keeps the result unsigned; without it the top bit turns it negative. */
function toAddress(value: number): string {
  const unsigned = value >>> 0
  return [24, 16, 8, 0].map((shift) => (unsigned >>> shift) & 255).join('.')
}

const PRIVATE_RANGES: [number, number][] = [
  [toNumber('10.0.0.0') ?? 0, 8],
  [toNumber('172.16.0.0') ?? 0, 12],
  [toNumber('192.168.0.0') ?? 0, 16],
  [toNumber('127.0.0.0') ?? 0, 8],
  [toNumber('169.254.0.0') ?? 0, 16],
]

export function parseCidr(input: string): Result<CidrInfo> {
  const trimmed = input.trim()
  if (trimmed === '') return err('error.emptyInput')

  const [addressPart, prefixPart = '32'] = trimmed.split('/')
  const address = toNumber(addressPart ?? '')
  const prefix = Number(prefixPart)

  if (address === null) return err('error.invalidCidr')
  if (!Number.isInteger(prefix) || prefix < 0 || prefix > 32) return err('error.invalidCidr')

  // A /0 mask would shift by 32, which JavaScript treats as a shift by 0 and
  // silently returns all ones instead of all zeros.
  const mask = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0
  const network = (address & mask) >>> 0
  const broadcast = (network | (~mask >>> 0)) >>> 0
  const total = 2 ** (32 - prefix)

  // /31 is a two-address point-to-point link and /32 is a single host, so
  // neither reserves a network and broadcast address the way larger blocks do.
  const hasReserved = prefix <= 30

  return ok({
    address: toAddress(address),
    prefix,
    netmask: toAddress(mask),
    wildcard: toAddress(~mask >>> 0),
    network: toAddress(network),
    broadcast: toAddress(broadcast),
    firstHost: toAddress(hasReserved ? network + 1 : network),
    lastHost: toAddress(hasReserved ? broadcast - 1 : broadcast),
    totalAddresses: total,
    usableHosts: hasReserved ? Math.max(0, total - 2) : total,
    isPrivate: PRIVATE_RANGES.some(([base, bits]) => {
      const rangeMask = (0xffffffff << (32 - bits)) >>> 0
      return (address & rangeMask) >>> 0 === base
    }),
  })
}

/** True when the address sits inside the block, the question subnetting is for. */
export function contains(block: CidrInfo, address: string): boolean {
  const value = toNumber(address)
  if (value === null) return false

  const network = toNumber(block.network)
  const broadcast = toNumber(block.broadcast)
  if (network === null || broadcast === null) return false

  return value >= network && value <= broadcast
}
