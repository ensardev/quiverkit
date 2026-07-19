import { dateDifference } from '@quiverkit/core'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { DataRow, ErrorNote, Panel, ToolShell } from '@/components/ui'

function isoDay(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, '0')
  return [date.getFullYear(), pad(date.getMonth() + 1), pad(date.getDate())].join('-')
}

export default function DateDiffTool() {
  const { t, i18n } = useTranslation()
  const [from, setFrom] = useState(() => isoDay(new Date()))
  const [to, setTo] = useState(() => {
    const later = new Date()
    later.setMonth(later.getMonth() + 1)
    return isoDay(later)
  })

  const result = useMemo(() => dateDifference(new Date(from), new Date(to)), [from, to])
  const number = useMemo(() => new Intl.NumberFormat(i18n.language), [i18n.language])

  const field = (value: string, onChange: (next: string) => void, label: string) => (
    <label className="flex-1 space-y-1">
      <span className="text-muted text-sm">{label}</span>
      <input
        type="date"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="border-line bg-surface focus:border-accent w-full rounded-lg border px-3 py-2 font-mono text-sm transition-colors focus:outline-none"
      />
    </label>
  )

  return (
    <ToolShell id="dateDiff">
      <div className="flex flex-col gap-3 sm:flex-row">
        {field(from, setFrom, t('tools.dateDiff.from'))}
        {field(to, setTo, t('tools.dateDiff.to'))}
      </div>

      {result.ok ? (
        <>
          <div className="bg-accent-soft text-accent rounded-lg px-4 py-4 text-center">
            <span className="font-mono text-3xl font-semibold">
              {number.format(result.value.totalDays)}
            </span>
            <span className="ml-2 text-sm">{t('tools.dateDiff.days')}</span>
          </div>

          <Panel label={t('common.output')}>
            <div>
              <DataRow
                label={t('tools.dateDiff.breakdown')}
                value={t('tools.dateDiff.parts', {
                  years: result.value.years,
                  months: result.value.months,
                  days: result.value.days,
                })}
              />
              <DataRow
                label={t('tools.dateDiff.workingDays')}
                value={number.format(result.value.workingDays)}
                hint={t('tools.dateDiff.workingHint')}
              />
              <DataRow
                label={t('tools.dateDiff.hours')}
                value={number.format(result.value.totalHours)}
              />
              <DataRow
                label={t('tools.dateDiff.minutes')}
                value={number.format(result.value.totalMinutes)}
              />
              <DataRow
                label={t('tools.dateDiff.weeks')}
                value={number.format(Math.floor(result.value.totalDays / 7))}
              />
            </div>
          </Panel>
        </>
      ) : (
        <ErrorNote>{t(result.error)}</ErrorNote>
      )}
    </ToolShell>
  )
}
