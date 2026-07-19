import { findInvisibles, stripInvisibles } from '@quiverkit/core'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CodeArea, CopyButton, Panel, ToolShell } from '@/components/ui'

const KIND_STYLES = {
  zeroWidth: 'bg-red-500/15 text-red-700 dark:text-red-300',
  bidi: 'bg-purple-500/15 text-purple-700 dark:text-purple-300',
  control: 'bg-orange-500/15 text-orange-700 dark:text-orange-300',
  space: 'bg-sky-500/15 text-sky-700 dark:text-sky-300',
  lineEnding: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
} as const

export default function InvisibleTool() {
  const { t } = useTranslation()
  const [input, setInput] = useState('')
  const [normaliseSpaces, setNormaliseSpaces] = useState(true)

  const found = useMemo(() => findInvisibles(input), [input])
  const cleaned = useMemo(
    () => stripInvisibles(input, { normaliseSpaces }),
    [input, normaliseSpaces],
  )

  const codePoint = (value: number) => `U+${value.toString(16).toUpperCase().padStart(4, '0')}`

  return (
    <ToolShell id="invisible">
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
        <CodeArea value={input} onChange={setInput} placeholder={t('tools.invisible.placeholder')} />
      </Panel>

      {input !== '' && (
        <div
          className={`rounded-lg px-4 py-2.5 text-sm ${
            found.length === 0
              ? 'bg-accent-soft text-accent'
              : 'bg-danger-soft text-danger'
          }`}
        >
          {found.length === 0
            ? t('tools.invisible.clean')
            : t('tools.invisible.found', { count: found.length })}
        </div>
      )}

      {found.length > 0 && (
        <>
          <Panel label={t('tools.invisible.characters')}>
            <div className="max-h-72 overflow-auto">
              {found.map((character, index) => (
                <div
                  key={index}
                  className="border-line flex items-center gap-3 border-b px-4 py-2 last:border-b-0"
                >
                  <span className="text-muted w-16 shrink-0 font-mono text-xs">
                    @{character.index}
                  </span>
                  <span className="w-20 shrink-0 font-mono text-sm">
                    {codePoint(character.codePoint)}
                  </span>
                  <span
                    className={`shrink-0 rounded px-2 py-0.5 text-xs font-medium ${KIND_STYLES[character.kind]}`}
                  >
                    {t(`tools.invisible.kind.${character.kind}`)}
                  </span>
                  <span className="text-muted truncate text-xs">{character.name}</span>
                </div>
              ))}
            </div>
          </Panel>

          <div className="flex flex-wrap items-center gap-3">
            <label className="text-muted flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={normaliseSpaces}
                onChange={(event) => setNormaliseSpaces(event.target.checked)}
                className="accent-accent size-4 cursor-pointer"
              />
              {t('tools.invisible.normalise')}
            </label>
          </div>

          <Panel label={t('tools.invisible.cleaned')} action={<CopyButton value={cleaned} />}>
            <CodeArea value={cleaned} readOnly />
          </Panel>
        </>
      )}

      <p className="text-muted text-sm">{t('tools.invisible.note')}</p>
    </ToolShell>
  )
}
