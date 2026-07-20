import { compareSemver, parseSemver, satisfies } from '@quiverkit/core'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useToolInput } from '@/hooks/useToolInput'
import { DataRow, ErrorNote, Panel, ToolShell } from '@/components/ui'

export default function SemverTool() {
  const { t } = useTranslation()
  const { value: left, setValue: setLeft } = useToolInput('1.2.3')
  const [right, setRight] = useState('1.10.0')
  const [range, setRange] = useState('^1.2.0')

  const parsedLeft = useMemo(() => parseSemver(left), [left])
  const parsedRight = useMemo(() => parseSemver(right), [right])

  const comparison = useMemo(() => {
    if (!parsedLeft.ok || !parsedRight.ok) return null
    return Math.sign(compareSemver(parsedLeft.value, parsedRight.value))
  }, [parsedLeft, parsedRight])

  const inRange = useMemo(
    () => (parsedLeft.ok ? satisfies(parsedLeft.value, range) : null),
    [parsedLeft, range],
  )

  const field = (value: string, onChange: (next: string) => void, label: string) => (
    <label className="flex-1 space-y-1">
      <span className="text-muted text-sm">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="border-line bg-surface focus:border-accent w-full rounded-lg border px-3 py-2 font-mono text-sm transition-colors focus:outline-none"
      />
    </label>
  )

  return (
    <ToolShell id="semver">
      <div className="flex flex-col gap-3 sm:flex-row">
        {field(left, setLeft, t('tools.semver.first'))}
        {field(right, setRight, t('tools.semver.second'))}
      </div>

      {comparison !== null && (
        <div className="bg-accent-soft text-accent rounded-lg px-4 py-3 text-center font-mono text-lg">
          {left} {comparison === 0 ? '=' : comparison < 0 ? '<' : '>'} {right}
        </div>
      )}

      {parsedLeft.ok ? (
        <Panel label={t('tools.semver.parts', { version: parsedLeft.value.raw })}>
          <div>
            <DataRow label="major" value={String(parsedLeft.value.major)} />
            <DataRow label="minor" value={String(parsedLeft.value.minor)} />
            <DataRow label="patch" value={String(parsedLeft.value.patch)} />
            <DataRow
              label="prerelease"
              value={parsedLeft.value.prerelease.join('.') || '—'}
              hint={t('tools.semver.prereleaseHint')}
            />
            <DataRow
              label="build"
              value={parsedLeft.value.build.join('.') || '—'}
              hint={t('tools.semver.buildHint')}
            />
          </div>
        </Panel>
      ) : (
        <ErrorNote>{t(parsedLeft.error)}</ErrorNote>
      )}

      <Panel label={t('tools.semver.range')}>
        <div className="space-y-3 p-4">
          <input
            value={range}
            onChange={(event) => setRange(event.target.value)}
            placeholder="^1.2.0"
            className="border-line bg-sunken focus:border-accent w-full rounded-lg border px-3 py-2 font-mono text-sm transition-colors focus:outline-none"
          />
          {inRange && (
            <p
              className={`rounded-lg px-3 py-2 text-sm ${
                inRange.ok
                  ? inRange.value
                    ? 'bg-accent-soft text-accent'
                    : 'bg-danger-soft text-danger'
                  : 'bg-danger-soft text-danger'
              }`}
            >
              {inRange.ok
                ? t(inRange.value ? 'tools.semver.matches' : 'tools.semver.noMatch', {
                    version: left,
                    range,
                  })
                : t(inRange.error)}
            </p>
          )}
        </div>
      </Panel>

      <p className="text-muted text-sm">{t('tools.semver.note')}</p>
    </ToolShell>
  )
}
