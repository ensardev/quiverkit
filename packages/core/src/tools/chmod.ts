import { err, ok, type Result } from '../result.js'

export interface PermissionSet {
  read: boolean
  write: boolean
  execute: boolean
}

export interface Permissions {
  owner: PermissionSet
  group: PermissionSet
  others: PermissionSet
  setuid: boolean
  setgid: boolean
  sticky: boolean
}

export const ROLES = ['owner', 'group', 'others'] as const

export type Role = (typeof ROLES)[number]

const empty = (): PermissionSet => ({ read: false, write: false, execute: false })

function digitToSet(digit: number): PermissionSet {
  return {
    read: (digit & 0b100) !== 0,
    write: (digit & 0b010) !== 0,
    execute: (digit & 0b001) !== 0,
  }
}

function setToDigit({ read, write, execute }: PermissionSet): number {
  return (read ? 4 : 0) + (write ? 2 : 0) + (execute ? 1 : 0)
}

export function parseOctal(input: string): Result<Permissions> {
  const trimmed = input.trim()
  if (trimmed === '') return err('error.emptyInput')
  if (!/^[0-7]{3,4}$/.test(trimmed)) return err('error.invalidPermissions')

  const digits = trimmed.padStart(4, '0')
  const special = Number(digits[0])

  return ok({
    owner: digitToSet(Number(digits[1])),
    group: digitToSet(Number(digits[2])),
    others: digitToSet(Number(digits[3])),
    setuid: (special & 0b100) !== 0,
    setgid: (special & 0b010) !== 0,
    sticky: (special & 0b001) !== 0,
  })
}

/**
 * Reads the `rwxr-xr-x` form, including the way the special bits hide inside the
 * execute column: `s` means setuid *and* execute, `S` means setuid without it.
 */
export function parseSymbolic(input: string): Result<Permissions> {
  const raw = input.trim()
  if (raw === '') return err('error.emptyInput')

  // `ls -l` prefixes the mode with a file type, and that prefix may itself be a
  // dash. Only drop it when there is a tenth character to drop, or "---------"
  // would lose one of its own dashes.
  const trimmed = raw.length === 10 && /^[-dlbcps]/.test(raw) ? raw.slice(1) : raw
  if (!/^[rwxsStT-]{9}$/.test(trimmed)) return err('error.invalidPermissions')

  const permissions: Permissions = {
    owner: empty(),
    group: empty(),
    others: empty(),
    setuid: false,
    setgid: false,
    sticky: false,
  }

  ROLES.forEach((role, index) => {
    const chunk = trimmed.slice(index * 3, index * 3 + 3)
    const set = permissions[role]
    set.read = chunk[0] === 'r'
    set.write = chunk[1] === 'w'

    const third = chunk[2]
    set.execute = third === 'x' || third === 's' || third === 't'

    if (role === 'owner' && (third === 's' || third === 'S')) permissions.setuid = true
    if (role === 'group' && (third === 's' || third === 'S')) permissions.setgid = true
    if (role === 'others' && (third === 't' || third === 'T')) permissions.sticky = true
  })

  return ok(permissions)
}

export function toOctal(permissions: Permissions): string {
  const special =
    (permissions.setuid ? 4 : 0) + (permissions.setgid ? 2 : 0) + (permissions.sticky ? 1 : 0)

  const body = ROLES.map((role) => setToDigit(permissions[role])).join('')

  return special === 0 ? body : `${special}${body}`
}

export function toSymbolic(permissions: Permissions): string {
  return ROLES.map((role) => {
    const set = permissions[role]
    const special =
      (role === 'owner' && permissions.setuid) ||
      (role === 'group' && permissions.setgid) ||
      (role === 'others' && permissions.sticky)

    const marker = role === 'others' ? 't' : 's'
    const third = special
      ? set.execute
        ? marker
        : marker.toUpperCase()
      : set.execute
        ? 'x'
        : '-'

    return `${set.read ? 'r' : '-'}${set.write ? 'w' : '-'}${third}`
  }).join('')
}

/** The `chmod` argument that produces these permissions. */
export function toCommand(permissions: Permissions): string {
  return `chmod ${toOctal(permissions)}`
}
