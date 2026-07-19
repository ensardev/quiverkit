import { describe, expect, it } from 'vitest'
import {
  generatePassword,
  passwordEntropy,
  passwordStrength,
  type PasswordOptions,
} from './password.js'

const base: PasswordOptions = {
  length: 20,
  lowercase: true,
  uppercase: true,
  digits: true,
  symbols: true,
  excludeAmbiguous: false,
}

function value(options: PasswordOptions): string {
  const result = generatePassword(options)
  if (!result.ok) throw new Error(`expected a password, got ${result.error}`)
  return result.value
}

describe('generatePassword', () => {
  it('honours the requested length', () => {
    expect(value({ ...base, length: 32 })).toHaveLength(32)
  })

  it('includes at least one character from every selected set', () => {
    // Repeated because the guarantee is about every run, not a lucky one.
    for (let attempt = 0; attempt < 50; attempt += 1) {
      const password = value({ ...base, length: 8 })
      expect(password).toMatch(/[a-z]/)
      expect(password).toMatch(/[A-Z]/)
      expect(password).toMatch(/\d/)
      expect(password).toMatch(/[!#$%&*+\-=?@^_~]/)
    }
  })

  it('uses only the selected sets', () => {
    const password = value({ ...base, uppercase: false, symbols: false, length: 40 })
    expect(password).toMatch(/^[a-z0-9]+$/)
  })

  it('drops characters that are easy to misread', () => {
    const password = value({ ...base, excludeAmbiguous: true, length: 100 })
    expect(password).not.toMatch(/[Il1O0o]/)
  })

  it('grows the length when it is shorter than the number of sets', () => {
    expect(value({ ...base, length: 2 })).toHaveLength(4)
  })

  it('refuses to generate without a character set', () => {
    expect(
      generatePassword({ ...base, lowercase: false, uppercase: false, digits: false, symbols: false }),
    ).toEqual({ ok: false, error: 'error.noCharacterSet' })
  })

  it('does not repeat itself', () => {
    const seen = new Set(Array.from({ length: 200 }, () => value(base)))
    expect(seen.size).toBe(200)
  })

  it('shuffles passwords longer than a single random byte can index', () => {
    // A one-byte draw cannot pick a swap target beyond 255, and the rejection
    // loop would spin forever rather than fail loudly.
    expect(value({ ...base, length: 512 })).toHaveLength(512)
  })

  it('spreads characters evenly across the alphabet', () => {
    // A biased `% alphabet.length` would make early letters noticeably more
    // common; with 26 letters over 26_000 draws, every count sits near 1000.
    const counts = new Map<string, number>()
    for (const character of value({ ...base, uppercase: false, digits: false, symbols: false, length: 26_000 })) {
      counts.set(character, (counts.get(character) ?? 0) + 1)
    }

    for (const count of counts.values()) {
      expect(count).toBeGreaterThan(800)
      expect(count).toBeLessThan(1200)
    }
  })
})

describe('passwordEntropy', () => {
  it('measures bits from pool size and length', () => {
    // 26 lowercase letters is log2(26) ≈ 4.7 bits per character.
    expect(passwordEntropy({ ...base, uppercase: false, digits: false, symbols: false, length: 10 })).toBe(47)
  })

  it('is zero without a character set', () => {
    expect(
      passwordEntropy({ ...base, lowercase: false, uppercase: false, digits: false, symbols: false }),
    ).toBe(0)
  })

  it('maps bits onto readable labels', () => {
    expect(passwordStrength(30)).toBe('weak')
    expect(passwordStrength(60)).toBe('fair')
    expect(passwordStrength(80)).toBe('strong')
    expect(passwordStrength(128)).toBe('excellent')
  })
})
