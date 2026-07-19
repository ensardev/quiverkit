import { useTranslation } from 'react-i18next'
import { changeLanguage, LANGUAGES } from '@/i18n'

export default function LanguagePicker() {
  const { i18n, t } = useTranslation()

  return (
    <label className="flex items-center gap-2">
      <span className="sr-only">{t('language.label')}</span>
      <select
        value={i18n.language}
        onChange={(event) => void changeLanguage(event.target.value)}
        className="text-muted hover:text-ink hover:bg-hover cursor-pointer rounded-lg bg-transparent px-2 py-1.5 text-sm transition-colors focus:outline-none"
      >
        {LANGUAGES.map((language) => (
          <option key={language.code} value={language.code} className="bg-surface text-ink">
            {language.label}
          </option>
        ))}
      </select>
    </label>
  )
}
