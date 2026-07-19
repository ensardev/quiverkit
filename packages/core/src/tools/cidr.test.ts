import { describe, expect, it } from 'vitest'
import { contains, parseCidr } from './cidr.js'

function info(input: string) {
  const result = parseCidr(input)
  if (!result.ok) throw new Error(`expected ${input} to parse`)
  return result.value
}

describe('parseCidr', () => {
  it('describes an ordinary block', () => {
    expect(info('192.168.1.130/24')).toMatchObject({
      netmask: '255.255.255.0',
      network: '192.168.1.0',
      broadcast: '192.168.1.255',
      firstHost: '192.168.1.1',
      lastHost: '192.168.1.254',
      usableHosts: 254,
      isPrivate: true,
    })
  })

  it('handles the edges where the usual arithmetic breaks', () => {
    // /0 shifts by 32, which JavaScript turns into a shift by 0.
    expect(info('0.0.0.0/0')).toMatchObject({ netmask: '0.0.0.0', totalAddresses: 2 ** 32 })
    // /31 and /32 reserve no network or broadcast address.
    expect(info('10.0.0.1/32')).toMatchObject({ usableHosts: 1, firstHost: '10.0.0.1' })
    expect(info('10.0.0.0/31')).toMatchObject({ usableHosts: 2 })
  })

  it('keeps high addresses unsigned', () => {
    expect(info('255.255.255.255/32').address).toBe('255.255.255.255')
  })

  it('rejects nonsense', () => {
    expect(parseCidr('300.1.1.1/24')).toEqual({ ok: false, error: 'error.invalidCidr' })
    expect(parseCidr('10.0.0.0/33')).toEqual({ ok: false, error: 'error.invalidCidr' })
  })

  it('tells whether an address is inside the block', () => {
    const block = info('192.168.1.0/24')
    expect(contains(block, '192.168.1.55')).toBe(true)
    expect(contains(block, '192.168.2.1')).toBe(false)
  })
})
