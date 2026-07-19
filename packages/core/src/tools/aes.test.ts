import { describe, expect, it } from 'vitest'
import { decryptAes, encryptAes } from './aes.js'

describe('aes', () => {
  it('round-trips a message', async () => {
    const encrypted = await encryptAes('İstanbul 🎯 secret', 'correct horse')
    if (!encrypted.ok) throw new Error('expected encryption to succeed')

    await expect(decryptAes(encrypted.value, 'correct horse')).resolves.toEqual({
      ok: true,
      value: 'İstanbul 🎯 secret',
    })
  })

  it('refuses the wrong passphrase instead of returning garbage', async () => {
    const encrypted = await encryptAes('secret', 'right')
    if (!encrypted.ok) throw new Error('expected encryption to succeed')

    await expect(decryptAes(encrypted.value, 'wrong')).resolves.toEqual({
      ok: false,
      error: 'error.decryptFailed',
    })
  })

  it('produces different ciphertext each time', async () => {
    const first = await encryptAes('same', 'key')
    const second = await encryptAes('same', 'key')
    expect(first.ok && second.ok && first.value).not.toBe(second.ok && second.value)
  })

  it('detects tampering', async () => {
    const encrypted = await encryptAes('secret message here', 'key')
    if (!encrypted.ok) throw new Error('expected encryption to succeed')

    const broken = `${encrypted.value.slice(0, -6)}AAAAA=`
    await expect(decryptAes(broken, 'key')).resolves.toEqual({
      ok: false,
      error: 'error.decryptFailed',
    })
  })
})
