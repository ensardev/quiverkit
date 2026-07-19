import { HASH_ALGORITHMS, hashText, hmac, type HashAlgorithm } from '@quiverkit/core'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CodeArea, DataRow, Panel, ToolShell } from '@/components/ui'

type Digests = Partial<Record<HashAlgorithm, string>>

export default function HashTool() {
  const { t } = useTranslation()
  const [input, setInput] = useState('')
  const [secret, setSecret] = useState('')
  const [digests, setDigests] = useState<Digests>({})

  useEffect(() => {
    if (input === '') {
      setDigests({})
      return
    }

    // Hashing is async, so a fast typist can have several runs in flight at
    // once. The flag makes sure only the newest one is allowed to write state,
    // otherwise a slower earlier run could overwrite a newer result.
    let current = true

    void (async () => {
      const entries = await Promise.all(
        HASH_ALGORITHMS.map(async (algorithm) => {
          const result = secret === ''
            ? await hashText(input, algorithm)
            : await hmac(input, secret, algorithm)
          return [algorithm, result.ok ? result.value : ''] as const
        }),
      )

      if (current) setDigests(Object.fromEntries(entries))
    })()

    return () => {
      current = false
    }
  }, [input, secret])

  return (
    <ToolShell id="hash">
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel
          label={t('common.input')}
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

        <Panel label={t('tools.hash.secret')}>
          <div className="flex flex-1 flex-col gap-2 p-4">
            <input
              value={secret}
              onChange={(event) => setSecret(event.target.value)}
              placeholder={t('tools.hash.secretPlaceholder')}
              className="border-line bg-sunken placeholder:text-muted focus:border-accent w-full rounded-lg border px-3 py-2 font-mono text-sm transition-colors focus:outline-none"
            />
            <p className="text-muted text-sm">{t('tools.hash.secretHint')}</p>
          </div>
        </Panel>
      </div>

      <Panel label={secret === '' ? t('tools.hash.digests') : t('tools.hash.hmacDigests')}>
        <div>
          {HASH_ALGORITHMS.map((algorithm) => (
            <DataRow key={algorithm} label={algorithm} value={digests[algorithm] ?? ''} />
          ))}
        </div>
      </Panel>

      <p className="text-muted text-sm">{t('tools.hash.md5Note')}</p>
    </ToolShell>
  )
}
