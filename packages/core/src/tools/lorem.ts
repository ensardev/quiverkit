const WORDS =
  'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua enim ad minim veniam quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo consequat duis aute irure in reprehenderit voluptate velit esse cillum eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt culpa qui officia deserunt mollit anim id est laborum'.split(
    ' ',
  )

/** The passage everyone recognises, kept word for word. */
const OPENING = 'lorem ipsum dolor sit amet, consectetur adipiscing elit'

export type LoremUnit = 'words' | 'sentences' | 'paragraphs'

export interface LoremOptions {
  unit: LoremUnit
  count: number
  startWithLorem: boolean
}

const MAX_COUNT = 200

function pick(index: number): string {
  return WORDS[index % WORDS.length] as string
}

function capitalise(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

function sentence(seed: number, length: number): string {
  const words = Array.from({ length }, (_, index) => pick(seed + index * 7))
  return capitalise(words.join(' ')) + '.'
}

/**
 * Builds a run of sentences. The opening only ever belongs to the very first
 * one — it is what makes the text recognisable as placeholder, and repeating it
 * in every paragraph would look like a bug rather than a convention.
 */
function sentences(start: number, howMany: number, withOpening: boolean): string {
  const parts = Array.from({ length: howMany }, (_, index) =>
    sentence(start + index * 11, 8 + ((start + index) % 7)),
  )

  if (withOpening) parts[0] = capitalise(OPENING) + '.'

  return parts.join(' ')
}

export function generateLorem(options: LoremOptions): string {
  const count = Math.max(1, Math.min(options.count, MAX_COUNT))
  const opening = options.startWithLorem

  if (options.unit === 'words') {
    const openingWords = OPENING.replace(',', '').split(' ')
    const words = Array.from({ length: count }, (_, index) => pick(index * 3))

    if (opening) words.splice(0, Math.min(openingWords.length, words.length), ...openingWords)

    return words.slice(0, count).join(' ')
  }

  if (options.unit === 'sentences') return sentences(0, count, opening)

  return Array.from({ length: count }, (_, index) =>
    sentences(index * 23, 3 + (index % 3), opening && index === 0),
  ).join('\n\n')
}
