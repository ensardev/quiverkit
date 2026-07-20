import { diffLines, diffWords } from '@quiverkit/core'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CodeArea, Panel, ToolShell } from '@/components/ui'

const ROW_STYLES = {
  equal: '',
  insert: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  delete: 'bg-red-500/10 text-red-700 dark:text-red-300',
} as const

const MARKERS = { equal: ' ', insert: '+', delete: '-' } as const

export default function DiffTool() {
  const { t } = useTranslation()
  const [left, setLeft] = useState('')
  const [right, setRight] = useState('')
  const [ignoreCase, setIgnoreCase] = useState(false)
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(false)

  const diff = useMemo(
    () => diffLines(left, right, { ignoreCase, ignoreWhitespace }),
    [left, right, ignoreCase, ignoreWhitespace],
  )

  const empty = left === '' && right === ''

  /**
   * A deletion immediately followed by an insertion is a line that changed
   * rather than two unrelated edits, so the words inside it are compared too —
   * otherwise a one-character fix lights up the whole line.
   */
  const wordsFor = (index: number) => {
    const current = diff.lines[index]
    const next = diff.lines[index + 1]
    const previous = diff.lines[index - 1]

    if (current?.operation === 'delete' && next?.operation === 'insert') {
      return diffWords(current.value, next.value).filter((part) => part.operation !== 'insert')
    }
    if (current?.operation === 'insert' && previous?.operation === 'delete') {
      return diffWords(previous.value, current.value).filter((part) => part.operation !== 'delete')
    }

    return null
  }

  return (
    <ToolShell id="diff">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
        <label className="text-muted flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={ignoreCase}
            onChange={(event) => setIgnoreCase(event.target.checked)}
            className="accent-accent size-4 cursor-pointer"
          />
          {t('tools.diff.ignoreCase')}
        </label>
        <label className="text-muted flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={ignoreWhitespace}
            onChange={(event) => setIgnoreWhitespace(event.target.checked)}
            className="accent-accent size-4 cursor-pointer"
          />
          {t('tools.diff.ignoreWhitespace')}
        </label>
        {!empty && (
          <span className="text-muted ml-auto text-sm">
            <span className="text-emerald-600 dark:text-emerald-400">+{diff.added}</span>{' '}
            <span className="text-red-600 dark:text-red-400">−{diff.removed}</span>
          </span>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel label={t('tools.diff.original')}>
          <CodeArea value={left} onChange={setLeft} placeholder={t('tools.diff.original')} />
        </Panel>
        <Panel label={t('tools.diff.changed')}>
          <CodeArea value={right} onChange={setRight} placeholder={t('tools.diff.changed')} />
        </Panel>
      </div>

      {!empty && (
        <Panel label={t('tools.diff.result')}>
          <div className="max-h-[32rem] overflow-auto font-mono text-sm">
            {diff.lines.map((line, index) => {
              const words = wordsFor(index)

              return (
                <div key={index} className={`flex gap-3 px-4 py-0.5 ${ROW_STYLES[line.operation]}`}>
                  <span className="text-muted w-10 shrink-0 text-right text-xs select-none">
                    {line.left ?? ''}
                  </span>
                  <span className="text-muted w-10 shrink-0 text-right text-xs select-none">
                    {line.right ?? ''}
                  </span>
                  <span className="w-3 shrink-0 select-none">{MARKERS[line.operation]}</span>
                  <span className="whitespace-pre-wrap">
                    {words
                      ? words.map((part, position) =>
                          part.operation === 'equal' ? (
                            <span key={position}>{part.value}</span>
                          ) : (
                            <mark
                              key={position}
                              className={`rounded-sm px-0.5 ${
                                part.operation === 'delete'
                                  ? 'bg-red-500/30 text-inherit'
                                  : 'bg-emerald-500/30 text-inherit'
                              }`}
                            >
                              {part.value}
                            </mark>
                          ),
                        )
                      : line.value || ' '}
                  </span>
                </div>
              )
            })}
          </div>
        </Panel>
      )}
    </ToolShell>
  )
}
