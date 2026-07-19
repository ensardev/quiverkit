import { generateKeyPair, KEY_ALGORITHMS, type KeyAlgorithm, type KeyPairPem } from '@quiverkit/core'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, CodeArea, CopyButton, ErrorNote, Panel, SegmentedControl, ToolShell } from '@/components/ui'

export default function KeypairTool() {
  const { t } = useTranslation()
  const [algorithm, setAlgorithm] = useState<KeyAlgorithm>('ECDSA-P256')
  const [pair, setPair] = useState<KeyPairPem | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [working, setWorking] = useState(false)

  async function generate() {
    setWorking(true)
    setError(null)

    const result = await generateKeyPair(algorithm)
    setWorking(false)

    if (result.ok) setPair(result.value)
    else {
      setPair(null)
      setError(result.error)
    }
  }

  return (
    <ToolShell id="keypair">
      <div className="flex flex-wrap items-center gap-3">
        <SegmentedControl
          value={algorithm}
          onChange={setAlgorithm}
          options={KEY_ALGORITHMS.map((name) => ({ value: name, label: name }))}
        />
        <Button variant="primary" onClick={() => void generate()}>
          {working ? t('tools.keypair.working') : t('tools.keypair.generate')}
        </Button>
      </div>

      <p className="text-muted text-sm">{t(`tools.keypair.hint.${algorithm}`)}</p>

      {error && <ErrorNote>{t(error)}</ErrorNote>}

      {pair && (
        <div className="grid gap-4">
          <Panel
            label={t('tools.keypair.publicKey')}
            action={<CopyButton value={pair.publicKey} />}
          >
            <CodeArea value={pair.publicKey} readOnly />
          </Panel>
          <Panel
            label={t('tools.keypair.privateKey')}
            action={<CopyButton value={pair.privateKey} />}
          >
            <CodeArea value={pair.privateKey} readOnly />
          </Panel>
        </div>
      )}

      <p className="text-muted text-sm">{t('tools.keypair.note')}</p>
    </ToolShell>
  )
}
