import { describe, expect, it } from 'vitest'
import { generateLorem, LOREM_LANGUAGES } from './lorem.js'

describe('generateLorem', () => {
  it('produces the requested number of words', () => {
    const text = generateLorem({ language: 'latin', unit: 'words', count: 12, startWithLorem: false })
    expect(text.split(' ')).toHaveLength(12)
  })

  it('opens with the traditional two words when asked', () => {
    const text = generateLorem({ language: 'latin', unit: 'words', count: 8, startWithLorem: true })
    expect(text.startsWith('lorem ipsum')).toBe(true)
  })

  it('produces the requested number of paragraphs', () => {
    const text = generateLorem({ language: 'tr', unit: 'paragraphs', count: 3, startWithLorem: false })
    expect(text.split('\n\n')).toHaveLength(3)
  })

  it('writes Japanese without spaces and with its own full stop', () => {
    const text = generateLorem({ language: 'ja', unit: 'sentences', count: 2, startWithLorem: false })
    expect(text).toContain('。')
    expect(text).not.toContain(' ')
  })

  it('writes something in every language it offers', () => {
    for (const language of LOREM_LANGUAGES) {
      const text = generateLorem({ language, unit: 'sentences', count: 1, startWithLorem: false })
      expect(text.length).toBeGreaterThan(5)
    }
  })

  it('caps an absurd request rather than hanging', () => {
    const text = generateLorem({ language: 'en', unit: 'words', count: 100_000, startWithLorem: false })
    expect(text.split(' ').length).toBeLessThanOrEqual(200)
  })
})
