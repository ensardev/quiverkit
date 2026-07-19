import { CASE_STYLES, convertCase, slugify } from '@quiverkit/core'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CodeArea, DataRow, Panel, ToolShell } from '@/components/ui'

export default function CaseTool() {
  const { t, i18n } = useTranslation()
  const [input, setInput] = useState('')

  const rows = useMemo(() => {
    const styles = CASE_STYLES.map((style) => ({
      key: style,
      label: t(`tools.case.style.${style}`),
      value: input === '' ? '' : convertCase(input, style, i18n.language),
    }))

    return [
      ...styles,
      { key: 'slug', label: t('tools.case.style.slug'), value: input === '' ? '' : slugify(input) },
    ]
  }, [input, t, i18n.language])

  return (
    <ToolShell id="case">
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
        <CodeArea value={input} onChange={setInput} placeholder="getHTTPResponse_code" />
      </Panel>

      <Panel label={t('common.output')}>
        <div>
          {rows.map((row) => (
            <DataRow key={row.key} label={row.label} value={row.value} />
          ))}
        </div>
      </Panel>

      <p className="text-muted text-sm">{t('tools.case.localeNote')}</p>
    </ToolShell>
  )
}
