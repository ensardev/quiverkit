import { highlightMatches, testRegex } from '@quiverkit/core'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CodeArea, ErrorNote, Panel, ToolShell } from '@/components/ui'

const FLAGS = [
  { flag: 'i', key: 'ignoreCase' },
  { flag: 'm', key: 'multiline' },
  { flag: 's', key: 'dotAll' },
  { flag: 'u', key: 'unicode' },
] as const

export default function RegexTool() {
  const { t } = useTranslation()
  const [pattern, setPattern] = useState('\\b\\w+@\\w+\\.\\w+\\b')
  const [flags, setFlags] = useState('gi')
  const [input, setInput] = useState('Write to ada@example.com or grace@example.org.')

  const result = useMemo(() => testRegex(pattern, flags, input), [pattern, flags, input])
  const matches = result.ok ? result.value : []

  const parts = useMemo(
    () => (result.ok ? highlightMatches(input, matches) : []),
    [result, input, matches],
  )

  function toggleFlag(flag: string) {
    setFlags((current) =>
      current.includes(flag) ? current.replaceAll(flag, '') : `${current}${flag}`,
    )
  }

  return (
    <ToolShell id="regex">
      <div className="flex flex-wrap items-center gap-3">
        <div className="border-line bg-surface focus-within:border-accent flex flex-1 items-center rounded-lg border px-3 font-mono text-sm transition-colors">
          <span className="text-muted">/</span>
          <input
            value={pattern}
            onChange={(event) => setPattern(event.target.value)}
            className="min-w-0 flex-1 bg-transparent px-1 py-2 focus:outline-none"
            spellCheck={false}
          />
          <span className="text-muted">/{flags}</span>
        </div>
        {FLAGS.map(({ flag, key }) => (
          <label key={flag} className="text-muted flex cursor-pointer items-center gap-1.5 text-sm">
            <input
              type="checkbox"
              checked={flags.includes(flag)}
              onChange={() => toggleFlag(flag)}
              className="accent-accent size-4 cursor-pointer"
            />
            <span className="font-mono">{flag}</span>
            <span className="sr-only">{t(`tools.regex.flag.${key}`)}</span>
          </label>
        ))}
      </div>

      {!result.ok && <ErrorNote>{t(result.error)}</ErrorNote>}

      <div className="grid flex-1 gap-4 lg:grid-cols-2">
        <Panel label={t('tools.regex.subject')}>
          <CodeArea value={input} onChange={setInput} placeholder={t('tools.regex.subject')} />
        </Panel>

        <Panel
          label={t('tools.regex.matches', { count: matches.length })}
          action={<span className="text-muted text-xs">{matches.length}</span>}
        >
          <div className="min-h-64 flex-1 overflow-auto px-4 py-3 font-mono text-sm leading-relaxed whitespace-pre-wrap">
            {parts.map((part, index) =>
              part.matched ? (
                <mark key={index} className="bg-accent-soft text-accent rounded px-0.5">
                  {part.value}
                </mark>
              ) : (
                <span key={index}>{part.value}</span>
              ),
            )}
          </div>
        </Panel>
      </div>

      {matches.length > 0 && (
        <Panel label={t('tools.regex.groups')}>
          <div className="max-h-64 overflow-auto">
            {matches.map((match, index) => (
              <div key={index} className="border-line border-b px-4 py-2 last:border-b-0">
                <div className="flex items-baseline gap-3">
                  <span className="text-muted w-8 shrink-0 text-xs">#{index + 1}</span>
                  <span className="font-mono text-sm break-all">{match.value}</span>
                  <span className="text-muted ml-auto shrink-0 text-xs">@{match.index}</span>
                </div>
                {match.groups.length > 0 && (
                  <div className="mt-1 ml-11 space-y-0.5">
                    {match.groups.map((group, position) => (
                      <div key={position} className="text-muted font-mono text-xs">
                        {group.name ?? position + 1}: {group.value ?? '—'}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Panel>
      )}
    </ToolShell>
  )
}
