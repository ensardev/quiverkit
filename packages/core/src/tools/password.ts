import { err, ok, type Result } from '../result.js'

const SETS = {
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  digits: '0123456789',
  symbols: '!#$%&*+-=?@^_~',
} as const

/** Characters that are easy to misread when a password is typed by hand. */
const AMBIGUOUS = new Set([...'Il1O0o'])

export interface PasswordOptions {
  length: number
  lowercase: boolean
  uppercase: boolean
  digits: boolean
  symbols: boolean
  excludeAmbiguous: boolean
}

const RANGE = 2 ** 32

/**
 * `random % alphabet.length` looks harmless but is biased: the range does not
 * divide evenly by, say, 62, so the first few characters of the alphabet come up
 * more often. Rejecting the values in that uneven tail keeps every character
 * equally likely — the whole point of a generated password.
 *
 * The draw is 32 bits rather than 8 because this also picks swap targets while
 * shuffling, where the limit is the password length and can exceed 256. With a
 * single byte, `Math.floor(256 / limit)` would floor to zero there and the
 * rejection loop would never terminate.
 */
function randomIndex(limit: number): number {
  if (limit <= 1) return 0

  const ceiling = Math.floor(RANGE / limit) * limit
  const buffer = new Uint32Array(1)

  let value: number
  do {
    crypto.getRandomValues(buffer)
    value = buffer[0] ?? 0
  } while (value >= ceiling)

  return value % limit
}

function pick(alphabet: string): string {
  return alphabet[randomIndex(alphabet.length)] ?? ''
}

function shuffle(characters: string[]): string[] {
  const result = [...characters]

  for (let index = result.length - 1; index > 0; index -= 1) {
    const target = randomIndex(index + 1)
    const held = result[index] as string
    result[index] = result[target] as string
    result[target] = held
  }

  return result
}

function activeSets(options: PasswordOptions): string[] {
  const filter = (alphabet: string) =>
    options.excludeAmbiguous
      ? [...alphabet].filter((character) => !AMBIGUOUS.has(character)).join('')
      : alphabet

  return (['lowercase', 'uppercase', 'digits', 'symbols'] as const)
    .filter((name) => options[name])
    .map((name) => filter(SETS[name]))
    .filter((alphabet) => alphabet !== '')
}

export function generatePassword(options: PasswordOptions): Result<string> {
  const sets = activeSets(options)
  if (sets.length === 0) return err('error.noCharacterSet')

  const length = Math.max(options.length, sets.length)
  const pool = sets.join('')

  // One character from each selected set first, so "include digits" is a
  // guarantee rather than a probability, then fill the rest from everything.
  const characters = [
    ...sets.map(pick),
    ...Array.from({ length: length - sets.length }, () => pick(pool)),
  ]

  return ok(shuffle(characters).join(''))
}

/**
 * Bits of entropy, the honest measure of strength: how many guesses an attacker
 * needs, not whether the string happens to contain a symbol.
 */
export function passwordEntropy(options: PasswordOptions): number {
  const pool = activeSets(options).join('')
  if (pool === '') return 0

  return Math.round(Math.max(options.length, 1) * Math.log2(pool.length))
}

export type PasswordStrength = 'weak' | 'fair' | 'strong' | 'excellent'

export function passwordStrength(entropy: number): PasswordStrength {
  if (entropy < 50) return 'weak'
  if (entropy < 75) return 'fair'
  if (entropy < 100) return 'strong'
  return 'excellent'
}
