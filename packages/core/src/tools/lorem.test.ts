import { describe, expect, it } from 'vitest'
import { generateLorem } from './lorem.js'

describe('generateLorem', () => {
  it('produces the requested number of words', () => {
    const text = generateLorem({ unit: 'words', count: 12, startWithLorem: false })
    expect(text.split(' ')).toHaveLength(12)
  })

  it('opens with the traditional two words when asked', () => {
    const text = generateLorem({ unit: 'words', count: 8, startWithLorem: true })
    expect(text.startsWith('lorem ipsum')).toBe(true)
  })

  it('produces the requested number of paragraphs', () => {
    const text = generateLorem({ unit: 'paragraphs', count: 3, startWithLorem: false })
    expect(text.split('\n\n')).toHaveLength(3)
  })

  it('writes sentences that start with a capital and end with a full stop', () => {
    const text = generateLorem({ unit: 'sentences', count: 2, startWithLorem: false })

    for (const part of text.split('. ')) {
      expect(part.charAt(0)).toBe(part.charAt(0).toUpperCase())
    }
    expect(text.endsWith('.')).toBe(true)
  })

  it('is stable, so the same request gives the same text', () => {
    const options = { unit: 'paragraphs', count: 2, startWithLorem: true } as const
    expect(generateLorem(options)).toBe(generateLorem(options))
  })

  it('caps an absurd request rather than hanging', () => {
    const text = generateLorem({ unit: 'words', count: 100_000, startWithLorem: false })
    expect(text.split(' ').length).toBeLessThanOrEqual(200)
  })
})
