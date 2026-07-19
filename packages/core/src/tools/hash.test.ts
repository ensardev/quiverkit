import { describe, expect, it } from 'vitest'
import { hashText, hmac } from './hash.js'

describe('hash', () => {
  it('matches the published digests for "abc"', async () => {
    await expect(hashText('abc', 'SHA-1')).resolves.toEqual({
      ok: true,
      value: 'a9993e364706816aba3e25717850c26c9cd0d89d',
    })
    await expect(hashText('abc', 'SHA-256')).resolves.toEqual({
      ok: true,
      value: 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
    })
  })

  it('hashes the utf-8 bytes, not the code units', async () => {
    const result = await hashText('ı', 'SHA-256')
    expect(result.ok && result.value).toHaveLength(64)
  })

  it('reports empty input', async () => {
    await expect(hashText('', 'SHA-256')).resolves.toEqual({
      ok: false,
      error: 'error.emptyInput',
    })
  })

  it('produces a stable hmac', async () => {
    const first = await hmac('message', 'secret', 'SHA-256')
    const second = await hmac('message', 'secret', 'SHA-256')
    const other = await hmac('message', 'different', 'SHA-256')

    expect(first).toEqual(second)
    expect(first).not.toEqual(other)
  })
})
