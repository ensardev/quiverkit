import { formatSql, minifySql } from '@quiverkit/core'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CodeArea, CopyButton, Panel, SegmentedControl, ToolShell } from '@/components/ui'

type Mode = 'format' | 'minify'

export default function SqlTool() {
  const { t } = useTranslation()
  const [mode, setMode] = useState<Mode>('format')
  const [indent, setIndent] = useState(2)
  const [input, setInput] = useState(
    'select u.id, u.name, count(o.id) as orders from users u left join orders o on o.user_id = u.id where u.active = true and u.age > 18 group by u.id order by orders desc limit 10',
  )

  const output = useMemo(
    () => (mode === 'format' ? formatSql(input, indent) : minifySql(input)),
    [input, mode, indent],
  )

  return (
    <ToolShell id="sql">
      <div className="flex flex-wrap items-center gap-3">
        <SegmentedControl
          value={mode}
          onChange={setMode}
          options={[
            { value: 'format', label: t('tools.sql.format') },
            { value: 'minify', label: t('tools.sql.minify') },
          ]}
        />
        {mode === 'format' && (
          <SegmentedControl
            value={String(indent)}
            onChange={(value) => setIndent(Number(value))}
            options={[2, 4].map((size) => ({ value: String(size), label: String(size) }))}
          />
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel label={t('common.input')}>
          <CodeArea value={input} onChange={setInput} placeholder="select * from users" />
        </Panel>
        <Panel label={t('common.output')} action={<CopyButton value={output} />}>
          <CodeArea value={output} readOnly />
        </Panel>
      </div>

      <p className="text-muted text-sm">{t('tools.sql.note')}</p>
    </ToolShell>
  )
}
