import { CRON_PRESETS, nextRuns, parseCron } from '@quiverkit/core'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, DataRow, ErrorNote, Panel, ToolShell } from '@/components/ui'

const FIELD_KEYS = ['minutes', 'hours', 'daysOfMonth', 'months', 'daysOfWeek'] as const

export default function CronTool() {
  const { t, i18n } = useTranslation()
  const [expression, setExpression] = useState('*/15 9-17 * * mon-fri')

  const schedule = useMemo(() => parseCron(expression), [expression])

  const runs = useMemo(
    () => (schedule.ok ? nextRuns(schedule.value, new Date(), 5) : []),
    [schedule],
  )

  const formatter = useMemo(
    () => new Intl.DateTimeFormat(i18n.language, { dateStyle: 'full', timeStyle: 'short' }),
    [i18n.language],
  )

  const summarise = (values: number[], max: number) =>
    values.length > max ? t('tools.cron.every') : values.join(', ')

  return (
    <ToolShell id="cron">
      <input
        value={expression}
        onChange={(event) => setExpression(event.target.value)}
        placeholder="*/15 9-17 * * mon-fri"
        className="border-line bg-surface focus:border-accent w-full rounded-lg border px-3 py-2 text-center font-mono text-lg transition-colors focus:outline-none"
        spellCheck={false}
      />

      <div className="flex flex-wrap gap-2">
        {Object.keys(CRON_PRESETS).map((preset) => (
          <Button key={preset} onClick={() => setExpression(preset)}>
            {preset}
          </Button>
        ))}
      </div>

      {schedule.ok ? (
        <>
          <Panel label={t('tools.cron.fields')}>
            <div>
              {FIELD_KEYS.map((key, index) => (
                <DataRow
                  key={key}
                  label={t(`tools.cron.field.${key}`)}
                  value={summarise(schedule.value[key], [59, 23, 30, 11, 6][index] as number)}
                />
              ))}
            </div>
          </Panel>

          <Panel label={t('tools.cron.nextRuns')}>
            {runs.length > 0 ? (
              <div>
                {runs.map((run) => (
                  <DataRow key={run.toISOString()} label="" value={formatter.format(run)} />
                ))}
              </div>
            ) : (
              <p className="text-muted px-4 py-3 text-sm">{t('tools.cron.never')}</p>
            )}
          </Panel>
        </>
      ) : (
        <ErrorNote>{t(schedule.error)}</ErrorNote>
      )}

      <p className="text-muted text-sm">{t('tools.cron.note')}</p>
    </ToolShell>
  )
}
