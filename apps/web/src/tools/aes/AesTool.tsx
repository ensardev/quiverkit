import { decryptAes, encryptAes } from '@quiverkit/core'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CodeArea, CopyButton, ErrorNote, Panel, SegmentedControl, ToolShell } from '@/components/ui'

type Mode = 'encrypt' | 'decrypt'

export default function AesTool() {
  const { t } = useTranslation()
  const [mode, setMode] = useState<Mode>('encrypt')
  const [passphrase, setPassphrase] = useState('')
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [working, setWorking] = useState(false)

  useEffect(() => {
    if (input === '' || passphrase === '') {
      setOutput('')
      setError(null)
      return
    }

    // Key derivation runs 250k PBKDF2 rounds, so it is slow on purpose. The flag
    // makes sure a stale run cannot overwrite a newer result.
    let current = true
    setWorking(true)

    const timer = setTimeout(async () => {
      const result = mode === 'encrypt'
        ? await encryptAes(input, passphrase)
        : await decryptAes(input, passphrase)

      if (!current) return
      setWorking(false)
      if (result.ok) {
        setOutput(result.value)
        setError(null)
      } else {
        setOutput('')
        setError(result.error)
      }
    }, 350)

    return () => {
      current = false
      clearTimeout(timer)
    }
  }, [input, passphrase, mode])

  return (
    <ToolShell id="aes">
      <div className="flex flex-wrap items-center gap-3">
        <SegmentedControl
          value={mode}
          onChange={setMode}
          options={[
            { value: 'encrypt', label: t('tools.aes.encrypt') },
            { value: 'decrypt', label: t('tools.aes.decrypt') },
          ]}
        />
        <input
          type="password"
          value={passphrase}
          onChange={(event) => setPassphrase(event.target.value)}
          placeholder={t('tools.aes.passphrase')}
          className="border-line bg-surface placeholder:text-muted focus:border-accent min-w-64 flex-1 rounded-lg border px-3 py-2 font-mono text-sm transition-colors focus:outline-none"
        />
        {working && <span className="text-muted text-sm">{t('tools.aes.working')}</span>}
      </div>

      <div className="grid flex-1 gap-4 lg:grid-cols-2">
        <Panel
          label={mode === 'encrypt' ? t('tools.aes.plaintext') : t('tools.aes.ciphertext')}
          action={
            input !== '' && (
              <button
                type="button"
                onClick={() => setInput('')}
                className="text-muted hover:text-ink cursor-pointer text-xs font-medium transition-colors"
              >
                {t('common.clear')}
              </button>
            )
          }
        >
          <CodeArea value={input} onChange={setInput} placeholder={t('common.input')} />
        </Panel>

        <Panel
          label={mode === 'encrypt' ? t('tools.aes.ciphertext') : t('tools.aes.plaintext')}
          action={<CopyButton value={output} />}
        >
          <CodeArea value={output} readOnly />
          {error && <ErrorNote>{t(error)}</ErrorNote>}
        </Panel>
      </div>

      <p className="text-muted text-sm">{t('tools.aes.note')}</p>
    </ToolShell>
  )
}
