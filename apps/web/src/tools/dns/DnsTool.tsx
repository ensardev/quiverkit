import {
  buildQueryUrl,
  describeTtl,
  parseResponse,
  RECORD_TYPES,
  RESOLVER,
  type DnsRecord,
  type RecordType,
} from '@quiverkit/core'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, ErrorNote, NetworkBadge, Panel, SegmentedControl, ToolShell } from '@/components/ui'

export default function DnsTool() {
  const { t, i18n } = useTranslation()
  const [domain, setDomain] = useState('')
  const [type, setType] = useState<RecordType>('A')
  const [records, setRecords] = useState<DnsRecord[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [working, setWorking] = useState(false)

  const relative = new Intl.RelativeTimeFormat(i18n.language, { numeric: 'auto' })

  async function lookup() {
    const url = buildQueryUrl(domain, type)
    if (!url.ok) {
      setError(url.error)
      setRecords(null)
      return
    }

    setWorking(true)
    setError(null)

    try {
      const response = await fetch(url.value, { headers: { accept: 'application/dns-json' } })
      const parsed = parseResponse(await response.json())

      if (parsed.ok) setRecords(parsed.value)
      else setError(parsed.error)
    } catch {
      setError('error.networkFailed')
      setRecords(null)
    } finally {
      setWorking(false)
    }
  }

  return (
    <ToolShell id="dns">
      <div className="space-y-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3">
        <div className="flex items-center gap-2">
          <NetworkBadge />
          <span className="text-sm font-medium">{t('tools.dns.warningTitle')}</span>
        </div>
        <p className="text-muted text-sm">{t('tools.dns.warning', { resolver: new URL(RESOLVER).hostname })}</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <input
          value={domain}
          onChange={(event) => setDomain(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') void lookup()
          }}
          placeholder="example.com"
          className="border-line bg-surface placeholder:text-muted focus:border-accent min-w-56 flex-1 rounded-lg border px-3 py-2 font-mono text-sm transition-colors focus:outline-none"
          spellCheck={false}
        />
        <Button variant="primary" onClick={() => void lookup()}>
          {working ? t('tools.dns.working') : t('tools.dns.lookup')}
        </Button>
      </div>

      <SegmentedControl
        value={type}
        onChange={setType}
        options={RECORD_TYPES.map((name) => ({ value: name, label: name }))}
      />

      {error && <ErrorNote>{t(error)}</ErrorNote>}

      {records && (
        <Panel label={t('tools.dns.records', { count: records.length })}>
          {records.length === 0 ? (
            <p className="text-muted px-4 py-6 text-center text-sm">{t('tools.dns.empty')}</p>
          ) : (
            <div className="max-h-96 overflow-auto">
              {records.map((record, index) => {
                const ttl = describeTtl(record.ttl)
                return (
                  <div
                    key={index}
                    className="border-line flex items-baseline gap-4 border-b px-4 py-2.5 last:border-b-0"
                  >
                    <span className="text-accent w-14 shrink-0 font-mono text-sm">{record.type}</span>
                    <span className="flex-1 font-mono text-sm break-all">{record.value}</span>
                    <span className="text-muted shrink-0 text-xs">
                      {relative.format(ttl.amount, ttl.unit).replace(/^(in |after )/, '')}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </Panel>
      )}

      <p className="text-muted text-sm">{t('tools.dns.note')}</p>
    </ToolShell>
  )
}
