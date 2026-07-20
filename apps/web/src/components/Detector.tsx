import { detect, type Detection } from '@quiverkit/core'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { findTool } from '@/tools/registry'

function confidenceLabel(confidence: number): 'sure' | 'likely' | 'maybe' {
  if (confidence >= 0.9) return 'sure'
  if (confidence >= 0.6) return 'likely'
  return 'maybe'
}

const BADGE_STYLES = {
  sure: 'bg-accent-soft text-accent',
  likely: 'bg-sky-500/15 text-sky-700 dark:text-sky-300',
  maybe: 'bg-hover text-muted',
} as const

interface DetectorProps {
  /** The home page gives it more room than the sidebar tool page does. */
  rows?: number
  autoFocus?: boolean
  /**
   * Text handed in from outside — the extension fills this with whatever was
   * selected on the page before the panel opened.
   */
  initialValue?: string
}

export default function Detector({ rows = 4, autoFocus = false, initialValue = '' }: DetectorProps) {
  const { t } = useTranslation()
  const [input, setInput] = useState(initialValue)

  // A second selection can arrive while the panel is already open, and nothing
  // remounts in that case.
  useEffect(() => {
    if (initialValue !== '') setInput(initialValue)
  }, [initialValue])

  const results = useMemo(() => detect(input), [input])

  return (
    <div className="space-y-3">
      <textarea
        value={input}
        onChange={(event) => setInput(event.target.value)}
        rows={rows}
        autoFocus={autoFocus}
        spellCheck={false}
        placeholder={t('detector.placeholder')}
        className="border-line bg-surface placeholder:text-muted focus:border-accent w-full resize-y rounded-xl border px-4 py-3 font-mono text-sm transition-colors focus:outline-none"
      />

      {input.trim() !== '' &&
        (results.length === 0 ? (
          <p className="text-muted border-line rounded-xl border border-dashed px-4 py-6 text-center text-sm">
            {t('detector.unknown')}
          </p>
        ) : (
          <ul className="space-y-2">
            {results.map((result: Detection, index) => {
              const tool = findTool(result.tool)
              const level = confidenceLabel(result.confidence)

              return (
                <li key={`${result.kind}-${index}`}>
                  <Link
                    to={`/${result.tool}`}
                    state={{ detectedInput: input }}
                    className="border-line bg-surface hover:border-accent flex items-center gap-3 rounded-xl border px-4 py-3 transition-colors"
                  >
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${BADGE_STYLES[level]}`}
                    >
                      {t(`detector.level.${level}`)}
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="font-medium">{t(`detector.kind.${result.kind}`)}</div>
                      {result.preview && (
                        <div className="text-muted truncate font-mono text-xs">{result.preview}</div>
                      )}
                    </div>

                    {tool && (
                      <span className="text-muted shrink-0 text-sm">
                        {t(`tools.${tool.id}.name`)} →
                      </span>
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        ))}
    </div>
  )
}
