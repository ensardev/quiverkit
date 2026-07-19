import {
  parseOctal,
  parseSymbolic,
  ROLES,
  toCommand,
  toOctal,
  toSymbolic,
  type Permissions,
  type Role,
} from '@quiverkit/core'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { DataRow, Panel, ToolShell } from '@/components/ui'

const ACTIONS = ['read', 'write', 'execute'] as const

const START: Permissions = {
  owner: { read: true, write: true, execute: true },
  group: { read: true, write: false, execute: true },
  others: { read: true, write: false, execute: true },
  setuid: false,
  setgid: false,
  sticky: false,
}

export default function ChmodTool() {
  const { t } = useTranslation()
  const [permissions, setPermissions] = useState<Permissions>(START)

  // The two text fields and the checkbox grid are three views of one value:
  // whichever the user touches, the others follow.
  function fromText(value: string, parse: typeof parseOctal) {
    const parsed = parse(value)
    if (parsed.ok) setPermissions(parsed.value)
  }

  function toggle(role: Role, action: (typeof ACTIONS)[number]) {
    setPermissions((current) => ({
      ...current,
      [role]: { ...current[role], [action]: !current[role][action] },
    }))
  }

  function toggleSpecial(bit: 'setuid' | 'setgid' | 'sticky') {
    setPermissions((current) => ({ ...current, [bit]: !current[bit] }))
  }

  return (
    <ToolShell id="chmod">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="space-y-1">
          <span className="text-muted text-sm">{t('tools.chmod.octal')}</span>
          <input
            value={toOctal(permissions)}
            onChange={(event) => fromText(event.target.value, parseOctal)}
            className="border-line bg-surface focus:border-accent w-full rounded-lg border px-3 py-2 font-mono text-lg transition-colors focus:outline-none"
          />
        </label>
        <label className="space-y-1">
          <span className="text-muted text-sm">{t('tools.chmod.symbolic')}</span>
          <input
            value={toSymbolic(permissions)}
            onChange={(event) => fromText(event.target.value, parseSymbolic)}
            className="border-line bg-surface focus:border-accent w-full rounded-lg border px-3 py-2 font-mono text-lg transition-colors focus:outline-none"
          />
        </label>
      </div>

      <Panel label={t('tools.chmod.permissions')}>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-line text-muted border-b">
              <th className="px-4 py-2 text-left font-medium">{t('tools.chmod.role')}</th>
              {ACTIONS.map((action) => (
                <th key={action} className="px-4 py-2 font-medium">
                  {t(`tools.chmod.action.${action}`)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROLES.map((role) => (
              <tr key={role} className="border-line border-b last:border-b-0">
                <td className="px-4 py-2">{t(`tools.chmod.who.${role}`)}</td>
                {ACTIONS.map((action) => (
                  <td key={action} className="px-4 py-2 text-center">
                    <input
                      type="checkbox"
                      checked={permissions[role][action]}
                      onChange={() => toggle(role, action)}
                      className="accent-accent size-4 cursor-pointer"
                      aria-label={`${t(`tools.chmod.who.${role}`)} ${t(`tools.chmod.action.${action}`)}`}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>

      <div className="flex flex-wrap gap-x-6 gap-y-2">
        {(['setuid', 'setgid', 'sticky'] as const).map((bit) => (
          <label key={bit} className="text-muted flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={permissions[bit]}
              onChange={() => toggleSpecial(bit)}
              className="accent-accent size-4 cursor-pointer"
            />
            {t(`tools.chmod.special.${bit}`)}
          </label>
        ))}
      </div>

      <Panel label={t('tools.chmod.command')}>
        <div>
          <DataRow label="chmod" value={toCommand(permissions)} />
          <DataRow label={t('tools.chmod.octal')} value={toOctal(permissions)} />
          <DataRow label={t('tools.chmod.symbolic')} value={toSymbolic(permissions)} />
        </div>
      </Panel>

      <p className="text-muted text-sm">{t('tools.chmod.note')}</p>
    </ToolShell>
  )
}
