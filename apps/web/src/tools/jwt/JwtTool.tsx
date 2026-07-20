import { claimAsDate, decodeJwt, verifyJwt, type VerifyOutcome } from '@quiverkit/core'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useToolInput } from '@/hooks/useToolInput'
import { CodeArea, CopyButton, DataRow, ErrorNote, Panel, ShareButton, ToolShell } from '@/components/ui'

/** Claims that carry a unix time and are worth showing as a real date. */
const TIME_CLAIMS = ['iat', 'nbf', 'exp'] as const

const OUTCOME_STYLES: Record<VerifyOutcome, string> = {
  valid: 'bg-accent-soft text-accent',
  invalid: 'bg-danger-soft text-danger',
  unsupported: 'bg-hover text-muted',
}

export default function JwtTool() {
  const { t, i18n } = useTranslation()
  const { value: token, setValue: setToken, share } = useToolInput()
  const [secret, setSecret] = useState('')
  const [outcome, setOutcome] = useState<VerifyOutcome | null>(null)

  const result = useMemo(() => (token === '' ? null : decodeJwt(token)), [token])
  const decoded = result?.ok ? result.value : null

  useEffect(() => {
    if (!decoded || secret === '') {
      setOutcome(null)
      return
    }

    let current = true
    void verifyJwt(token, secret).then((verified) => {
      if (current) setOutcome(verified.ok ? verified.value : null)
    })

    return () => {
      current = false
    }
  }, [token, secret, decoded])

  const dates = useMemo(() => {
    if (!decoded) return []

    const formatter = new Intl.DateTimeFormat(i18n.language, {
      dateStyle: 'medium',
      timeStyle: 'medium',
    })

    return TIME_CLAIMS.flatMap((claim) => {
      const date = claimAsDate(decoded.payload, claim)
      return date ? [{ claim, text: formatter.format(date), date }] : []
    })
  }, [decoded, i18n.language])

  const expiry = dates.find((entry) => entry.claim === 'exp')
  const expired = expiry ? expiry.date.getTime() < Date.now() : false

  return (
    <ToolShell id="jwt">
      <div className="flex justify-end">
        <ShareButton share={share} disabled={token === ''} />
      </div>

      <Panel
        label={t('tools.jwt.token')}
        action={
          token !== '' && (
            <button
              type="button"
              onClick={() => setToken('')}
              className="text-muted hover:text-ink cursor-pointer text-xs font-medium transition-colors"
            >
              {t('common.clear')}
            </button>
          )
        }
      >
        <CodeArea
          value={token}
          onChange={setToken}
          placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
        />
        {result && !result.ok && <ErrorNote>{t(result.error)}</ErrorNote>}
      </Panel>

      {decoded && (
        <>
          {expiry && (
            <p
              className={`rounded-lg px-4 py-2.5 text-sm ${
                expired ? 'bg-danger-soft text-danger' : 'bg-accent-soft text-accent'
              }`}
            >
              {t(expired ? 'tools.jwt.expired' : 'tools.jwt.validUntil', { date: expiry.text })}
            </p>
          )}

          <div className="grid gap-4 lg:grid-cols-2">
            <Panel
              label={t('tools.jwt.header')}
              action={<CopyButton value={JSON.stringify(decoded.header, null, 2)} />}
            >
              <CodeArea value={JSON.stringify(decoded.header, null, 2)} readOnly />
            </Panel>
            <Panel
              label={t('tools.jwt.payload')}
              action={<CopyButton value={JSON.stringify(decoded.payload, null, 2)} />}
            >
              <CodeArea value={JSON.stringify(decoded.payload, null, 2)} readOnly />
            </Panel>
          </div>

          {dates.length > 0 && (
            <Panel label={t('tools.jwt.claims')}>
              <div>
                {dates.map((entry) => (
                  <DataRow
                    key={entry.claim}
                    label={entry.claim}
                    hint={t(`tools.jwt.claim.${entry.claim}`)}
                    value={entry.text}
                  />
                ))}
              </div>
            </Panel>
          )}

          <Panel label={t('tools.jwt.verify')}>
            <div className="space-y-3 p-4">
              <input
                type="password"
                value={secret}
                onChange={(event) => setSecret(event.target.value)}
                placeholder={t('tools.jwt.secretPlaceholder')}
                className="border-line bg-sunken placeholder:text-muted focus:border-accent w-full rounded-lg border px-3 py-2 font-mono text-sm transition-colors focus:outline-none"
              />
              {outcome && (
                <p className={`rounded-lg px-3 py-2 text-sm ${OUTCOME_STYLES[outcome]}`}>
                  {t(`tools.jwt.outcome.${outcome}`, { algorithm: String(decoded.header.alg ?? '?') })}
                </p>
              )}
              <p className="text-muted text-sm">{t('tools.jwt.verifyNote')}</p>
            </div>
          </Panel>

          <p className="text-muted text-sm">{t('tools.jwt.signatureNote')}</p>
        </>
      )}
    </ToolShell>
  )
}
