import { decodeCertificate, type CertInfo } from '@quiverkit/core'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CodeArea, CopyButton, DataRow, ErrorNote, Panel, ToolShell } from '@/components/ui'

export default function CertTool() {
  const { t, i18n } = useTranslation()
  const [input, setInput] = useState('')
  const [info, setInfo] = useState<CertInfo | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [working, setWorking] = useState(false)

  const formatter = new Intl.DateTimeFormat(i18n.language, {
    dateStyle: 'full',
    timeStyle: 'long',
  })

  async function decode() {
    setWorking(true)
    setError(null)
    setInfo(null)

    const result = await decodeCertificate(input)
    if (result.ok) {
      setInfo(result.value)
    } else {
      setError(result.error)
    }
    setWorking(false)
  }

  function renderRdn(obj: Record<string, string>): string {
    return Object.entries(obj)
      .map(([k, v]) => `${k}=${v}`)
      .join(', ')
  }

  return (
    <ToolShell id="cert">
      <div className="flex flex-wrap items-center gap-3">
        <CodeArea
          value={input}
          onChange={setInput}
          placeholder="-----BEGIN CERTIFICATE-----
MIID...
-----END CERTIFICATE-----"
        />
      </div>

      <button
        type="button"
        onClick={() => void decode()}
        disabled={input.trim() === ''}
        className="bg-accent text-on-accent hover:bg-accent-hover self-start rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50"
      >
        {working ? t('tools.cert.working') : t('tools.cert.decode')}
      </button>

      {error && <ErrorNote>{t(error)}</ErrorNote>}

      {info && (
        <div className="space-y-4">
          <Panel label={t('tools.cert.subject')}>
            <DataRow label={t('tools.cert.dn')} value={renderRdn(info.subject)} />
            <DataRow label={t('tools.cert.serial')} value={info.serialNumber} />
          </Panel>

          <Panel label={t('tools.cert.issuer')}>
            <DataRow label={t('tools.cert.dn')} value={renderRdn(info.issuer)} />
          </Panel>

          <Panel label={t('tools.cert.validity')}>
            <DataRow
              label={t('tools.cert.notBefore')}
              value={formatter.format(info.notBefore)}
            />
            <DataRow
              label={t('tools.cert.notAfter')}
              value={formatter.format(info.notAfter)}
            />
          </Panel>

          <Panel label={t('tools.cert.fingerprints')}>
            <DataRow label="SHA-1" value={info.fingerprintSha1} />
            <DataRow label="SHA-256" value={info.fingerprintSha256} />
          </Panel>

          <Panel label={t('tools.cert.publicKey')}>
            <DataRow label={t('tools.cert.algorithm')} value={info.publicKeyAlgorithm} />
            <DataRow label={t('tools.cert.keySize')} value={`${info.publicKeyBits} bits`} />
          </Panel>

          <Panel label={t('tools.cert.signature')}>
            <DataRow
              label={t('tools.cert.algorithm')}
              value={info.signatureAlgorithm}
            />
          </Panel>

          {info.subjectAltNames.length > 0 && (
            <Panel label={t('tools.cert.san')}>
              {info.subjectAltNames.map((name, i) => (
                <DataRow key={i} label={`DNS ${i + 1}`} value={name} />
              ))}
            </Panel>
          )}
        </div>
      )}
    </ToolShell>
  )
}
