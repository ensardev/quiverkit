import i18next from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en.json'

/**
 * English ships inside the main bundle; every other language is fetched only
 * when someone selects it. A visitor who never touches the picker downloads one
 * language, not twenty.
 */
const LOADERS: Record<string, () => Promise<{ default: typeof en }>> = {
  es: () => import('./locales/es.json'),
  tr: () => import('./locales/tr.json'),
}

export interface Language {
  code: string
  /** Written in its own language — nobody looks for "Turkish" in a Turkish UI. */
  label: string
}

export const LANGUAGES: Language[] = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'tr', label: 'Türkçe' },
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
