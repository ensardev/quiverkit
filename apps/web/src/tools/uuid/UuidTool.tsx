import { generateNanoId, generateUuidV4, generateUuidV7 } from '@quiverkit/core'
import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, CodeArea, CopyButton, Panel, SegmentedControl, ToolShell } from '@/components/ui'

type Kind = 'v4' | 'v7' | 'nanoid'

const GENERATORS: Record<Kind, () => string> = {
  v4: generateUuidV4,
  v7: generateUuidV7,
  nanoid: () => generateNanoId(),
}

const AMOUNTS = [1, 5, 25, 100] as const

export default function UuidTool() {
  const { t } = useTranslation()
  const [kind, setKind] = useState<Kind>('v4')
  const [amount, setAmount] = useState<number>(5)
  const [ids, setIds] = useState<string[]>([])

  const generate = useCallback(() => {
    setIds(Array.from({ length: amount }, GENERATORS[kind]))
  }, [kind, amount])

  // Fresh ids on arrival and whenever the options change: an empty box would
  // make the user click before seeing what the tool even does.
  useEffect(generate, [generate])

  return (
    <ToolShell id="uuid">
      <div className="flex flex-wrap items-center gap-3">
        <SegmentedControl
          value={kind}
          onChange={setKind}
          options={[
            { value: 'v4', label: t('tools.uuid.v4') },
            { value: 'v7', label: t('tools.uuid.v7') },
            { value: 'nanoid', label: t('tools.uuid.nanoid') },
          ]}
        />
        <SegmentedControl
          value={String(amount)}
          onChange={(value) => setAmount(Number(value))}
          options={AMOUNTS.map((size) => ({ value: String(size), label: `${size}` }))}
        />
        <Button variant="primary" onClick={generate}>
          {t('tools.uuid.regenerate')}
        </Button>
      </div>

      <p className="text-muted text-sm">{t(`tools.uuid.${kind}Hint`)}</p>

      <Panel label={t('common.output')} action={<CopyButton value={ids.join('\n')} />}>
        <CodeArea value={ids.join('\n')} readOnly />
      </Panel>
    </ToolShell>
  )
}
