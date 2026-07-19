import { optimiseSvg, toDataUri, toJsx } from '@quiverkit/core'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CodeArea, CopyButton, ErrorNote, Panel, SegmentedControl, ToolShell } from '@/components/ui'

type Target = 'optimise' | 'dataUri' | 'jsx'

const SAMPLE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
  <!-- an arrow -->
  <title>Arrow</title>
  <path d="M5 12h14M13 6l6 6-6 6" />
</svg>`

export default function SvgTool() {
  const { t, i18n } = useTranslation()
  const [target, setTarget] = useState<Target>('optimise')
  const [componentName, setComponentName] = useState('Icon')
  const [input, setInput] = useState(SAMPLE)

  const optimised = useMemo(() => optimiseSvg(input), [input])

  const result = useMemo(() => {
    if (target === 'optimise') {
      return optimised.ok ? ({ ok: true, value: optimised.value.markup } as const) : optimised
    }
    return target === 'dataUri' ? toDataUri(input) : toJsx(input, componentName)
  }, [target, input, optimised, componentName])

  const number = new Intl.NumberFormat(i18n.language)

  return (
    <ToolShell id="svg">
      <div className="flex flex-wrap items-center gap-3">
        <SegmentedControl
          value={target}
          onChange={setTarget}
          options={[
            { value: 'optimise', label: t('tools.svg.optimise') },
            { value: 'dataUri', label: 'Data URI' },
            { value: 'jsx', label: 'JSX' },
          ]}
        />
        {target === 'jsx' && (
          <input
            value={componentName}
            onChange={(event) => setComponentName(event.target.value)}
            className="border-line bg-sunken w-36 rounded-lg border px-2 py-1.5 font-mono text-sm focus:outline-none"
          />
        )}
        {optimised.ok && (
          <span className="text-muted text-sm">
            {number.format(optimised.value.stats.before)} →{' '}
            <span className="text-accent">{number.format(optimised.value.stats.after)}</span>{' '}
            {t('tools.svg.bytes')}
          </span>
        )}
      </div>

      {optimised.ok && (
        <div
          className="border-line bg-sunken text-ink flex h-32 items-center justify-center rounded-xl border"
          // The preview is the user's own markup, already stripped of scripts by
          // the optimiser; it never leaves this page.
          dangerouslySetInnerHTML={{ __html: optimised.value.markup }}
        />
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel label={t('common.input')}>
          <CodeArea value={input} onChange={setInput} placeholder="<svg …>" />
        </Panel>
        <Panel
          label={t('common.output')}
          action={<CopyButton value={result.ok ? result.value : ''} />}
        >
          <CodeArea value={result.ok ? result.value : ''} readOnly />
          {!result.ok && <ErrorNote>{t(result.error)}</ErrorNote>}
        </Panel>
      </div>

      <p className="text-muted text-sm">{t('tools.svg.note')}</p>
    </ToolShell>
  )
}
