import { generateMockData, MOCK_FIELDS, type MockField } from '@quiverkit/core'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, CodeArea, CopyButton, ErrorNote, Panel, ToolShell } from '@/components/ui'

interface Field {
  name: string
  type: MockField
}

export default function MockTool() {
  const { t } = useTranslation()
  const [fields, setFields] = useState<Field[]>([
    { name: 'id', type: 'uuid' },
    { name: 'name', type: 'fullName' },
    { name: 'email', type: 'email' },
    { name: 'createdAt', type: 'datetime' },
  ])
  const [count, setCount] = useState(10)
  const [seed, setSeed] = useState(1)

  const result = useMemo(() => generateMockData({ fields, count, seed }), [fields, count, seed])

  const update = (index: number, patch: Partial<Field>) =>
    setFields((current) =>
      current.map((field, position) => (position === index ? { ...field, ...patch } : field)),
    )

  return (
    <ToolShell id="mock">
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm">
          <span className="text-muted">{t('tools.mock.rows')}</span>
          <input
            type="number"
            min={1}
            max={500}
            value={count}
            onChange={(event) => setCount(Number(event.target.value))}
            className="border-line bg-sunken w-20 rounded-lg border px-2 py-1 text-center font-mono text-sm focus:outline-none"
          />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <span className="text-muted">{t('tools.mock.seed')}</span>
          <input
            type="number"
            value={seed}
            onChange={(event) => setSeed(Number(event.target.value))}
            className="border-line bg-sunken w-24 rounded-lg border px-2 py-1 text-center font-mono text-sm focus:outline-none"
          />
        </label>
        <Button variant="primary" onClick={() => setSeed((current) => current + 1)}>
          {t('tools.mock.reroll')}
        </Button>
      </div>

      <Panel label={t('tools.mock.fields')}>
        <div className="space-y-2 p-4">
          {fields.map((field, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                value={field.name}
                onChange={(event) => update(index, { name: event.target.value })}
                className="border-line bg-sunken flex-1 rounded-lg border px-2 py-1.5 font-mono text-sm focus:outline-none"
              />
              <select
                value={field.type}
                onChange={(event) => update(index, { type: event.target.value as MockField })}
                className="border-line bg-sunken text-ink cursor-pointer rounded-lg border px-2 py-1.5 text-sm focus:outline-none"
              >
                {MOCK_FIELDS.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
              {fields.length > 1 && (
                <button
                  type="button"
                  onClick={() => setFields((current) => current.filter((_, position) => position !== index))}
                  className="text-muted hover:text-danger cursor-pointer px-1 text-sm"
                  aria-label={t('common.clear')}
                >
                  ✕
                </button>
              )}
            </div>
          ))}

          <Button
            onClick={() => setFields((current) => [...current, { name: `field${current.length + 1}`, type: 'sentence' }])}
          >
            {t('tools.mock.addField')}
          </Button>
        </div>
      </Panel>

      <Panel label="JSON" action={<CopyButton value={result.ok ? result.value : ''} />}>
        <CodeArea value={result.ok ? result.value : ''} readOnly />
        {!result.ok && <ErrorNote>{t(result.error)}</ErrorNote>}
      </Panel>

      <p className="text-muted text-sm">{t('tools.mock.note')}</p>
    </ToolShell>
  )
}
