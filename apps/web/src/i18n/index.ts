import i18next from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en.json'

/**
 * English ships inside the main bundle; every other language is fetched only
 * when someone selects it. A visitor who never touches the picker downloads one
 * language, not twenty.
 *
 * Typed loosely rather than as `typeof en` on purpose: a translation is merged
 * over English and anything it has not filled in yet falls back, so a partial —
 * or still empty — file has to be allowed through.
 */
const LOADERS: Record<string, () => Promise<{ default: Record<string, unknown> }>> = {
  de: () => import('./locales/de.json'),
  es: () => import('./locales/es.json'),
  ja: () => import('./locales/ja.json'),
  ko: () => import('./locales/ko.json'),
  pt: () => import('./locales/pt.json'),
  ru: () => import('./locales/ru.json'),
  tr: () => import('./locales/tr.json'),
  zh: () => import('./locales/zh.json'),
}

export interface Language {
  code: string
  /** Written in its own language — nobody looks for "Turkish" in a Turkish UI. */
  label: string
}

/**
 * Ordered by code so the picker does not reshuffle as languages are added.
 * `zh` is Simplified Chinese: `detectLanguage` matches on the base tag, so a
 * zh-TW visitor lands here too until a Traditional file exists.
 */
export const LANGUAGES: Language[] = [
  { code: 'de', label: 'Deutsch' },
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'ja', label: '日本語' },
  { code: 'ko', label: '한국어' },
  { code: 'pt', label: 'Português' },
  { code: 'ru', label: 'Русский' },
  { code: 'tr', label: 'Türkçe' },
  { code: 'zh', label: '中文' },
]

const STORAGE_KEY = 'quiverkit.language'

function detectLanguage(): string {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored && LANGUAGES.some((language) => language.code === stored)) return stored

  // `navigator.languages` is ordered by preference and entries look like
  // "pt-BR", so we compare on the base tag only.
  for (const tag of navigator.languages) {
    const base = tag.split('-')[0]
    if (base && LANGUAGES.some((language) => language.code === base)) return base
  }

  return 'en'
}

export async function changeLanguage(code: string): Promise<void> {
  const loader = LOADERS[code]
  if (loader && !i18next.hasResourceBundle(code, 'translation')) {
    const module = await loader()
    i18next.addResourceBundle(code, 'translation', module.default)
  }

  await i18next.changeLanguage(code)
  localStorage.setItem(STORAGE_KEY, code)
  document.documentElement.lang = code
}

export async function initI18n(): Promise<void> {
  await i18next.use(initReactI18next).init({
    resources: { en: { translation: en } },
    lng: 'en',
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  })

  await changeLanguage(detectLanguage())
}

export { default as i18n } from 'i18next'
