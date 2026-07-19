const WORDS =
  'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua enim ad minim veniam quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo consequat duis aute irure in reprehenderit voluptate velit esse cillum eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt culpa qui officia deserunt mollit anim id est laborum'.split(
    ' ',
  )

export type LoremUnit = 'words' | 'sentences' | 'paragraphs'

export interface LoremOptions {
  unit: LoremUnit
  count: number
  /** The traditional opening, which readers recognise as placeholder text. */
  startWithLorem: boolean
}

const MAX_COUNT = 200

function pick(index: number): string {
  return WORDS[index % WORDS.length] as string
}

function sentence(seed: number, length: number): string {
  const words = Array.from({ length }, (_, index) => pick(seed + index * 7))
  const text = words.join(' ')

  return text.charAt(0).toUpperCase() + text.slice(1) + '.'
}

export function generateLorem(options: LoremOptions): string {
  const count = Math.max(1, Math.min(options.count, MAX_COUNT))

  if (options.unit === 'words') {
    const words = Array.from({ length: count }, (_, index) => pick(index * 3))
    if (options.startWithLorem) words.splice(0, Math.min(2, words.length), 'lorem', 'ipsum')
    return words.join(' ')
  }

  const sentences = (start: number, howMany: number) =>
    Array.from({ length: howMany }, (_, index) =>
      sentence(start + index * 11, 8 + ((start + index) % 7)),
    ).join(' ')

  if (options.unit === 'sentences') return sentences(0, count)

  return Array.from({ length: count }, (_, index) => sentences(index * 23, 3 + (index % 3))).join(
    '\n\n',
  )
}
