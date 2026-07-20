import {
  DEFAULT_TOTP,
  generateTotp,
  parseOtpUri,
  TOTP_ALGORITHMS,
  type TotpAlgorithm,
  type TotpCode,
} from '@quiverkit/core'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CopyButton, ErrorNote, Panel, SegmentedControl, ToolShell } from '@/components/ui'

export default function TotpTool() {
  const { t } = useTranslation()
  const [secret, setSecret] = useState('')
  const [digits, setDigits] = useState(6)
  const [period, setPeriod] = useState(30)
  const [algorithm, setAlgorithm] = useState<TotpAlgorithm>('SHA-1')
  const [code, setCode] = useState<TotpCode | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Recomputed every second so the countdown moves and the code rolls over on
  // its own, the way an authenticator app behaves.
  useEffect(() => {
    let current = true

    async function refresh() {
      if (secret.trim() === '') {
        setCode(null)
        setError(null)
        return
      }

      const result = await generateTotp({ ...DEFAULT_TOTP, secret, digits, period, algorithm })
      if (!current) return

      if (result.ok) {
        setCode(result.value)
        setError(null)
      } else {
        setCode(null)
        setError(result.error)
      }
    }

    void refresh()
    const timer = setInterval(() => void refresh(), 1000)

    return () => {
      current = false
      clearInterval(timer)
    }
  }, [secret, digits, period, algorithm])

  function paste(value: string) {
    if (!value.startsWith('otpauth://')) {
      setSecret(value)
      return
    }

    // Pasting the whole otpauth URI fills every field at once, which is what
    // people actually have to hand after scanning a QR code.
    const parsed = parseOtpUri(value)
    if (!parsed.ok) {
      setSecret(value)
      return
    }

    setSecret(parsed.value.secret)
    setDigits(parsed.value.digits)
    setPeriod(parsed.value.period)
    setAlgorithm(parsed.value.algorithm)
  }

  return (
    <ToolShell id="totp">
      <input
        value={secret}
        onChange={(event) => paste(event.target.value)}
        placeholder="JBSWY3DPEHPK3PXP"
        className="border-line bg-surface placeholder:text-muted focus:border-accent w-full rounded-lg border px-3 py-2 font-mono text-sm transition-colors focus:outline-none"
        spellCheck={false}
      />

      <div className="flex flex-wrap items-center gap-3">
        <SegmentedControl
          value={String(digits)}
          onChange={(value) => setDigits(Number(value))}
          options={[6, 7, 8].map((size) => ({ value: String(size), label: `${size}` }))}
        />
        <SegmentedControl
          value={String(period)}
          onChange={(value) => setPeriod(Number(value))}
          options={[30, 60].map((size) => ({ value: String(size), label: `${size}s` }))}
        />
        <SegmentedControl
          value={algorithm}
          onChange={setAlgorithm}
          options={TOTP_ALGORITHMS.map((name) => ({ value: name, label: name }))}
        />
      </div>

      {error && <ErrorNote>{t(error)}</ErrorNote>}

      {code && (
        <Panel label={t('tools.totp.code')} action={<CopyButton value={code.code} />}>
          <div className="space-y-3 p-6 text-center">
            <p className="font-mono text-5xl font-semibold tracking-[0.2em]">{code.code}</p>
            <div className="border-line mx-auto h-1.5 max-w-xs overflow-hidden rounded-full border">
              <div
                className={`h-full transition-all duration-1000 ease-linear ${
                  code.remaining <= 5 ? 'bg-danger' : 'bg-accent'
                }`}
                style={{ width: `${(code.remaining / period) * 100}%` }}
              />
            </div>
            <p className="text-muted text-sm">
              {t('tools.totp.remaining', { seconds: code.remaining })}
            </p>
          </div>
        </Panel>
      )}

      <p className="text-muted text-sm">{t('tools.totp.note')}</p>
    </ToolShell>
  )
}
