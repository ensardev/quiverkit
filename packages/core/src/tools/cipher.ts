export const CIPHERS = ['rot13', 'caesar', 'atbash', 'reverse', 'morse'] as const

export type Cipher = (typeof CIPHERS)[number]

const A = 'a'.charCodeAt(0)
const Z = 'z'.charCodeAt(0)
const UPPER_A = 'A'.charCodeAt(0)
const UPPER_Z = 'Z'.charCodeAt(0)

function shiftLetters(text: string, shift: number): string {
  return [...text]
    .map((character) => {
      const code = character.charCodeAt(0)
      const base = code >= A && code <= Z ? A : code >= UPPER_A && code <= UPPER_Z ? UPPER_A : null
      if (base === null) return character

      return String.fromCharCode(((code - base + shift + 26) % 26) + base)
    })
    .join('')
}

const MORSE: Record<string, string> = {
  a: '.-', b: '-...', c: '-.-.', d: '-..', e: '.', f: '..-.', g: '--.', h: '....',
  i: '..', j: '.---', k: '-.-', l: '.-..', m: '--', n: '-.', o: '---', p: '.--.',
  q: '--.-', r: '.-.', s: '...', t: '-', u: '..-', v: '...-', w: '.--', x: '-..-',
  y: '-.--', z: '--..', '0': '-----', '1': '.----', '2': '..---', '3': '...--',
  '4': '....-', '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.',
  '.': '.-.-.-', ',': '--..--', '?': '..--..', '!': '-.-.--', '/': '-..-.', '-': '-....-',
}

const FROM_MORSE = new Map(Object.entries(MORSE).map(([letter, code]) => [code, letter]))

/**
 * These are toys, not security — Caesar and friends were broken a thousand
 * years ago. They still earn a place because puzzles, CTFs and old exercises
 * use them constantly.
 */
export function applyCipher(text: string, cipher: Cipher, shift = 3): string {
  switch (cipher) {
    case 'rot13':
      return shiftLetters(text, 13)
    case 'caesar':
      return shiftLetters(text, shift)
    case 'atbash':
      return [...text]
        .map((character) => {
          const code = character.charCodeAt(0)
          if (code >= A && code <= Z) return String.fromCharCode(Z - (code - A))
          if (code >= UPPER_A && code <= UPPER_Z) return String.fromCharCode(UPPER_Z - (code - UPPER_A))
          return character
        })
        .join('')
    case 'reverse':
      // Splitting with the spread operator keeps surrogate pairs intact, so an
      // emoji survives being reversed instead of turning into two broken halves.
      return [...text].reverse().join('')
    case 'morse':
      return [...text.toLowerCase()]
        .map((character) => (character === ' ' ? '/' : (MORSE[character] ?? character)))
        .join(' ')
        .trim()
  }
}

export function reverseCipher(text: string, cipher: Cipher, shift = 3): string {
  switch (cipher) {
    case 'rot13':
    case 'atbash':
    case 'reverse':
      // Each of these is its own inverse.
      return applyCipher(text, cipher, shift)
    case 'caesar':
      return shiftLetters(text, -shift)
    case 'morse':
      return text
        .trim()
        .split(' ')
        .map((code) => (code === '/' ? ' ' : (FROM_MORSE.get(code) ?? code)))
        .join('')
  }
}
