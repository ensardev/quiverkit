import { ESCAPE_FLAVOURS, escapeText, unescapeText, type EscapeFlavour } from '@quiverkit/core'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useToolInput } from '@/hooks/useToolInput'
import { CodeArea, CopyButton, ErrorNote, Panel, SegmentedControl, ToolShell } from '@/components/ui'

type Direction = 'escape' | 'unescape'

export default function EscapeTool() {
  const { t } = useTranslation()
  const [flavour, setFlavour] = useState<EscapeFlavour>('json')
  const [direction, setDirection] = useState<Direction>('escape')
  const { value: input, setValue: setInput } = useToolInput()

  const result = useMemo(() => {
    if (input === '') return null
    return direction === 'escape'
      ? ({ ok: true, value: escapeText(input, flavour) } as const)
      : unescapeText(input, flavour)
  }, [input, flavour, direction])

  const output = result?.ok ? result.value : ''

  return (
    <ToolShell id="escape">
      <div className="flex flex-wrap items-center gap-3">
        <SegmentedControl
          value={flavour}
          onChange={setFlavour}
          options={ESCAPE_FLAVOURS.map((name) => ({
            value: name,
            label: t(`tools.escape.flavour.${name}`),
          }))}
        />
        <SegmentedControl
          value={direction}
          onChange={setDirection}
          options={[
            { value: 'escape', label: t('tools.escape.escape') },
            { value: 'unescape', label: t('tools.escape.unescape') },
          ]}
        />
      </div>

      <p className="text-muted text-sm">{t(`tools.escape.hint.${flavour}`)}</p>

      <div className="grid flex-1 gap-4 lg:grid-cols-2">
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

        <Panel label={t('common.output')} action={<CopyButton value={output} />}>
          <CodeArea value={output} readOnly />
          {result && !result.ok && <ErrorNote>{t(result.error)}</ErrorNote>}
        </Panel>
      </div>
    </ToolShell>
  )
}
