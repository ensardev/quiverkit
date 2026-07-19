import { COMMON_ZONES, readInZones } from '@quiverkit/core'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, Panel, ToolShell } from '@/components/ui'

function localInput(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, '0')
  const day = [date.getFullYear(), pad(date.getMonth() + 1), pad(date.getDate())].join('-')
  return day + 'T' + pad(date.getHours()) + ':' + pad(date.getMinutes())
}

export default function TimezoneTool() {
  const { t, i18n } = useTranslation()
  const [moment, setMoment] = useState(() => localInput(new Date()))
  const [zones, setZones] = useState<string[]>([
    'UTC',
    'Europe/Istanbul',
    'America/New_York',
    'Asia/Tokyo',
  ])

  const date = useMemo(() => new Date(moment), [moment])
  const readings = useMemo(() => readInZones(date, zones), [date, zones])

  const formatter = useMemo(
    () => new Intl.DateTimeFormat(i18n.language, { dateStyle: 'medium', timeStyle: 'short' }),
    [i18n.language],
  )

  const offsetLabel = (minutes: number) => {
    const sign = minutes < 0 ? '−' : '+'
    const absolute = Math.abs(minutes)
    return `UTC${sign}${String(Math.floor(absolute / 60)).padStart(2, '0')}:${String(absolute % 60).padStart(2, '0')}`
  }

  return (
    <ToolShell id="timezone">
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="datetime-local"
          value={moment}
          onChange={(event) => setMoment(event.target.value)}
          className="border-line bg-surface focus:border-accent rounded-lg border px-3 py-2 font-mono text-sm transition-colors focus:outline-none"
        />
        <Button variant="primary" onClick={() => setMoment(localInput(new Date()))}>
          {t('tools.timezone.now')}
        </Button>
      </div>

      <Panel label={t('tools.timezone.zones')}>
        {readings.ok ? (
          <div>
            {readings.value.map((reading) => (
              <div
                key={reading.zone}
                className="border-line flex items-center justify-between gap-4 border-b px-4 py-2.5 last:border-b-0"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm">{reading.zone.replace('_', ' ')}</div>
                  <div className="text-muted text-xs">{offsetLabel(reading.offsetMinutes)}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm">
                    {formatter.format(
                      new Date(date.toLocaleString('en-US', { timeZone: reading.zone })),
                    )}
                  </span>
                  <button
                    type="button"
                    onClick={() => setZones((current) => current.filter((zone) => zone !== reading.zone))}
                    className="text-muted hover:text-danger cursor-pointer text-xs"
                    aria-label={t('common.clear')}
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted px-4 py-3 text-sm">{t(readings.error)}</p>
        )}
      </Panel>

      <Panel label={t('tools.timezone.add')}>
        <div className="flex flex-wrap gap-2 p-4">
          {COMMON_ZONES.filter((zone) => !zones.includes(zone)).map((zone) => (
            <Button key={zone} onClick={() => setZones((current) => [...current, zone])}>
              {zone.replace('_', ' ')}
            </Button>
          ))}
        </div>
      </Panel>

      <p className="text-muted text-sm">{t('tools.timezone.note')}</p>
    </ToolShell>
  )
}
