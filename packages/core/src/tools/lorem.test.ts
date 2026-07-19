import { describe, expect, it } from 'vitest'
import { generateLorem } from './lorem.js'

describe('generateLorem', () => {
  it('produces the requested number of words', () => {
    const text = generateLorem({ unit: 'words', count: 12, startWithLorem: false })
    expect(text.split(' ')).toHaveLength(12)
  })

  it('opens with the traditional passage in every unit', () => {
    // The option used to apply to words only, so paragraphs quietly ignored it.
    expect(generateLorem({ unit: 'words', count: 8, startWithLorem: true })).toMatch(
      /^lorem ipsum dolor sit amet/,
    )
    expect(generateLorem({ unit: 'sentences', count: 2, startWithLorem: true })).toMatch(
      /^Lorem ipsum dolor sit amet, consectetur adipiscing elit\./,
    )
    expect(generateLorem({ unit: 'paragraphs', count: 3, startWithLorem: true })).toMatch(
      /^Lorem ipsum dolor sit amet, consectetur adipiscing elit\./,
    )
  })

  it('leaves the opening out when it is not asked for', () => {
    for (const unit of ['words', 'sentences', 'paragraphs'] as const) {
      const text = generateLorem({ unit, count: 3, startWithLorem: false })
      expect(text.toLowerCase().startsWith('lorem ipsum dolor')).toBe(false)
    }
  })

  it('uses the opening once, not at the top of every paragraph', () => {
    const paragraphs = generateLorem({ unit: 'paragraphs', count: 4, startWithLorem: true }).split(
      '\n\n',
    )

    expect(paragraphs).toHaveLength(4)
    for (const paragraph of paragraphs.slice(1)) {
      expect(paragraph.startsWith('Lorem ipsum dolor')).toBe(false)
    }
  })

  it('still respects the requested word count with the opening on', () => {
    const text = generateLorem({ unit: 'words', count: 5, startWithLorem: true })
    expect(text.split(' ')).toHaveLength(5)
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
