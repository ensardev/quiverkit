import { contains, parseCidr } from '@quiverkit/core'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { DataRow, ErrorNote, Panel, ToolShell } from '@/components/ui'

export default function CidrTool() {
  const { t, i18n } = useTranslation()
  const [input, setInput] = useState('192.168.1.130/24')
  const [candidate, setCandidate] = useState('')

  const result = useMemo(() => parseCidr(input), [input])
  const number = useMemo(() => new Intl.NumberFormat(i18n.language), [i18n.language])

  const inside = result.ok && candidate !== '' ? contains(result.value, candidate.trim()) : null

  return (
    <ToolShell id="cidr">
      <input
        value={input}
        onChange={(event) => setInput(event.target.value)}
        placeholder="192.168.1.0/24"
        className="border-line bg-surface placeholder:text-muted focus:border-accent w-full rounded-lg border px-3 py-2 font-mono text-lg transition-colors focus:outline-none"
        spellCheck={false}
      />

      {result.ok ? (
        <>
          <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2">
            <div>
              <span className="font-mono text-2xl font-semibold">
                {number.format(result.value.usableHosts)}
              </span>
              <span className="text-muted ml-2 text-sm">{t('tools.cidr.usableHosts')}</span>
            </div>
            {result.value.isPrivate && (
              <span className="bg-accent-soft text-accent rounded-full px-3 py-1 text-xs font-medium">
                {t('tools.cidr.private')}
              </span>
            )}
          </div>

          <Panel label={t('tools.cidr.block')}>
            <div>
              <DataRow label={t('tools.cidr.netmask')} value={result.value.netmask} />
              <DataRow label={t('tools.cidr.wildcard')} value={result.value.wildcard} />
              <DataRow label={t('tools.cidr.network')} value={result.value.network} />
              <DataRow label={t('tools.cidr.broadcast')} value={result.value.broadcast} />
              <DataRow label={t('tools.cidr.firstHost')} value={result.value.firstHost} />
              <DataRow label={t('tools.cidr.lastHost')} value={result.value.lastHost} />
              <DataRow
                label={t('tools.cidr.total')}
                value={number.format(result.value.totalAddresses)}
              />
            </div>
          </Panel>

          <Panel label={t('tools.cidr.check')}>
            <div className="space-y-3 p-4">
              <input
                value={candidate}
                onChange={(event) => setCandidate(event.target.value)}
                placeholder="192.168.1.55"
                className="border-line bg-sunken focus:border-accent w-full rounded-lg border px-3 py-2 font-mono text-sm transition-colors focus:outline-none"
                spellCheck={false}
              />
              {inside !== null && (
                <p
                  className={`rounded-lg px-3 py-2 text-sm ${
                    inside ? 'bg-accent-soft text-accent' : 'bg-danger-soft text-danger'
                  }`}
                >
                  {t(inside ? 'tools.cidr.inside' : 'tools.cidr.outside', {
                    address: candidate.trim(),
                    block: input.trim(),
                  })}
                </p>
              )}
            </div>
          </Panel>
        </>
      ) : (
        <ErrorNote>{t(result.error)}</ErrorNote>
      )}

      <p className="text-muted text-sm">{t('tools.cidr.note')}</p>
    </ToolShell>
  )
}
