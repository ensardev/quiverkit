/**
 * Placeholder text in the reader's own language. English lorem ipsum next to a
 * Turkish or Japanese layout hides exactly what a mock-up should reveal: how
 * the real script fills the space, where it wraps, how tall the lines run.
 */
export const LOREM_LANGUAGES = ['latin', 'en', 'tr', 'es', 'ja'] as const

export type LoremLanguage = (typeof LOREM_LANGUAGES)[number]

const WORDS: Record<LoremLanguage, string[]> = {
  latin: 'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua enim ad minim veniam quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo consequat duis aute irure in reprehenderit voluptate velit esse cillum eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt culpa qui officia deserunt mollit anim id est laborum'.split(' '),
  en: 'the quick design system needs a sensible default because most people never open the settings panel and simply live with whatever the first screen gave them which is why every choice here matters more than it looks'.split(' '),
  tr: 'bir tasarım sistemi makul varsayılanlara ihtiyaç duyar çünkü çoğu insan ayarlar ekranını hiç açmaz ve ilk gördüğü hâliyle yaşayıp gider bu yüzden buradaki her seçim göründüğünden daha fazla önem taşır'.split(' '),
  es: 'un sistema de diseño necesita valores por defecto sensatos porque la mayoría de la gente nunca abre el panel de ajustes y vive con lo que le dio la primera pantalla y por eso cada decisión importa más de lo que parece'.split(' '),
  ja: 'デザイン システム には 適切 な 初期 値 が 必要 です なぜなら 多く の 人 は 設定 画面 を 開か ない まま 最初 の 状態 で 使い 続ける から です'.split(' '),
}

/** Japanese does not put spaces between words, so the joiner differs. */
const JOINERS: Record<LoremLanguage, string> = {
  latin: ' ',
  en: ' ',
  tr: ' ',
  es: ' ',
  ja: '',
}

const TERMINATORS: Record<LoremLanguage, string> = {
  latin: '.',
  en: '.',
  tr: '.',
  es: '.',
  ja: '。',
}

export type LoremUnit = 'words' | 'sentences' | 'paragraphs'

export interface LoremOptions {
  language: LoremLanguage
  unit: LoremUnit
  count: number
  /** The traditional opening, which readers recognise as placeholder text. */
  startWithLorem: boolean
}

function pick(words: string[], index: number): string {
  return words[index % words.length] as string
}

function sentence(words: string[], language: LoremLanguage, seed: number, length: number): string {
  const chosen = Array.from({ length }, (_, index) => pick(words, seed + index * 7))
  const text = chosen.join(JOINERS[language])
  const capitalised = language === 'ja' ? text : text.charAt(0).toUpperCase() + text.slice(1)

  return capitalised + TERMINATORS[language]
}

export function generateLorem(options: LoremOptions): string {
  const words = WORDS[options.language]
  const count = Math.max(1, Math.min(options.count, 200))
  const joiner = JOINERS[options.language]

  if (options.unit === 'words') {
    const chosen = Array.from({ length: count }, (_, index) => pick(words, index * 3))
    if (options.startWithLorem && options.language === 'latin') {
      chosen.splice(0, Math.min(2, chosen.length), 'lorem', 'ipsum')
    }
    return chosen.join(joiner)
  }

  const sentences = (start: number, howMany: number) =>
    Array.from({ length: howMany }, (_, index) =>
      sentence(words, options.language, start + index * 11, 8 + ((start + index) % 7)),
    ).join(joiner === '' ? '' : ' ')

  if (options.unit === 'sentences') return sentences(0, count)

  return Array.from({ length: count }, (_, index) => sentences(index * 23, 3 + (index % 3))).join('\n\n')
}
