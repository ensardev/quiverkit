import { textStats } from '@quiverkit/core'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CodeArea, LocaleSelect, Panel, ToolShell } from '@/components/ui'

interface StatProps {
  label: string
  value: string
  hint?: string
}

function Stat({ label, value, hint }: StatProps) {
  return (
    <div className="border-line bg-surface rounded-xl border p-4">
      <div className="font-mono text-2xl font-semibold tracking-tight">{value}</div>
      <div className="text-muted mt-1 text-sm">{label}</div>
      {hint && <div className="text-muted/70 mt-0.5 text-xs">{hint}</div>}
    </div>
  )
}

export default function StatsTool() {
  const { t, i18n } = useTranslation()
  const [input, setInput] = useState('')
  const [locale, setLocale] = useState(i18n.language)

  // Word segmentation follows the text; digit grouping follows the interface.
  const stats = useMemo(() => textStats(input, locale), [input, locale])

  const number = useMemo(() => new Intl.NumberFormat(i18n.language), [i18n.language])

  const readingTime = useMemo(() => {
    const minutes = Math.floor(stats.readingSeconds / 60)
    const seconds = stats.readingSeconds % 60
    return minutes > 0
      ? t('tools.stats.minutesSeconds', { minutes, seconds })
      : t('tools.stats.seconds', { seconds })
  }, [stats.readingSeconds, t])

  return (
    <ToolShell id="stats">
      <LocaleSelect value={locale} onChange={setLocale} />

      <Panel
        label={t('common.input')}
        action={
          input !== '' && (
            <button
              type="button"
              onClick={() => setInput('')}
              className="text-muted hover:text-ink cursor-pointer text-xs font-medium transition-colors"
            >
              {t('common.clear')}
            </button>
          )
        }
      >
        <CodeArea value={input} onChange={setInput} placeholder={t('common.input')} />
      </Panel>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat
          label={t('tools.stats.characters')}
          value={number.format(stats.characters)}
          hint={t('tools.stats.charactersHint')}
        />
        <Stat label={t('tools.stats.words')} value={number.format(stats.words)} />
        <Stat label={t('tools.stats.sentences')} value={number.format(stats.sentences)} />
        <Stat label={t('tools.stats.readingTime')} value={readingTime} />
        <Stat
          label={t('tools.stats.charactersNoSpaces')}
          value={number.format(stats.charactersNoSpaces)}
        />
        <Stat label={t('tools.stats.lines')} value={number.format(stats.lines)} />
        <Stat label={t('tools.stats.paragraphs')} value={number.format(stats.paragraphs)} />
        <Stat
          label={t('tools.stats.bytes')}
          value={number.format(stats.bytes)}
          hint={t('tools.stats.bytesHint', { codeUnits: number.format(stats.codeUnits) })}
        />
      </div>

      <p className="text-muted text-sm">{t('tools.stats.segmenterNote')}</p>
    </ToolShell>
  )
}
