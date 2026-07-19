import {
  generatePassword,
  passwordEntropy,
  passwordStrength,
  type PasswordOptions,
} from '@quiverkit/core'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, CopyButton, ErrorNote, Panel, ToolShell } from '@/components/ui'

const SET_NAMES = ['lowercase', 'uppercase', 'digits', 'symbols'] as const

const STRENGTH_COLOURS = {
  weak: 'bg-danger',
  fair: 'bg-amber-500',
  strong: 'bg-lime-600',
  excellent: 'bg-emerald-600',
} as const

export default function PasswordTool() {
  const { t } = useTranslation()
  const [options, setOptions] = useState<PasswordOptions>({
    length: 20,
    lowercase: true,
    uppercase: true,
    digits: true,
    symbols: true,
    excludeAmbiguous: false,
  })
  const [result, setResult] = useState(() => generatePassword(options))

  const generate = useCallback(() => setResult(generatePassword(options)), [options])

  useEffect(generate, [generate])

  const entropy = useMemo(() => passwordEntropy(options), [options])
  const strength = passwordStrength(entropy)

  const update = <K extends keyof PasswordOptions>(key: K, value: PasswordOptions[K]) =>
    setOptions((current) => ({ ...current, [key]: value }))

  return (
    <ToolShell id="password">
      <Panel
        label={t('common.output')}
        action={<CopyButton value={result.ok ? result.value : ''} />}
      >
        {result.ok ? (
          <p className="px-4 py-6 font-mono text-lg break-all">{result.value}</p>
        ) : (
          <ErrorNote>{t(result.error)}</ErrorNote>
        )}
      </Panel>

      <div className="flex flex-wrap items-center gap-3">
        <Button variant="primary" onClick={generate}>
          {t('tools.password.regenerate')}
        </Button>
        <div className="flex flex-1 items-center gap-3">
          <div className="border-line h-2 flex-1 overflow-hidden rounded-full border">
            <div
              className={`h-full transition-all ${STRENGTH_COLOURS[strength]}`}
              style={{ width: `${Math.min(100, (entropy / 128) * 100)}%` }}
            />
          </div>
          <span className="text-muted min-w-40 text-right text-sm">
            {t(`tools.password.strength.${strength}`)} · {t('tools.password.bits', { entropy })}
          </span>
        </div>
      </div>

      <Panel label={t('tools.password.options')}>
        <div className="space-y-4 p-4">
          <label className="block">
            <span className="text-muted text-sm">
              {t('tools.password.length')}: <span className="text-ink font-mono">{options.length}</span>
            </span>
            <input
              type="range"
              min={8}
              max={64}
              value={options.length}
              onChange={(event) => update('length', Number(event.target.value))}
              className="accent-accent mt-2 w-full cursor-pointer"
            />
          </label>

          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {SET_NAMES.map((name) => (
              <label key={name} className="text-muted flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={options[name]}
                  onChange={(event) => update(name, event.target.checked)}
                  className="accent-accent size-4 cursor-pointer"
                />
                {t(`tools.password.set.${name}`)}
              </label>
            ))}
            <label className="text-muted flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={options.excludeAmbiguous}
                onChange={(event) => update('excludeAmbiguous', event.target.checked)}
                className="accent-accent size-4 cursor-pointer"
              />
              {t('tools.password.excludeAmbiguous')}
            </label>
          </div>
        </div>
      </Panel>

      <p className="text-muted text-sm">{t('tools.password.entropyNote')}</p>
    </ToolShell>
  )
}
