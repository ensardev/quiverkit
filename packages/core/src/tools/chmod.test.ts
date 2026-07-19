import { describe, expect, it } from 'vitest'
import { parseOctal, parseSymbolic, toOctal, toSymbolic } from './chmod.js'

function octal(input: string) {
  const result = parseOctal(input)
  if (!result.ok) throw new Error(`expected ${input} to parse`)
  return result.value
}

function symbolic(input: string) {
  const result = parseSymbolic(input)
  if (!result.ok) throw new Error(`expected ${input} to parse`)
  return result.value
}

describe('chmod', () => {
  it('translates the everyday values', () => {
    expect(toSymbolic(octal('755'))).toBe('rwxr-xr-x')
    expect(toSymbolic(octal('644'))).toBe('rw-r--r--')
    expect(toSymbolic(octal('600'))).toBe('rw-------')
    expect(toSymbolic(octal('777'))).toBe('rwxrwxrwx')
    expect(toSymbolic(octal('000'))).toBe('---------')
  })

  it('reads symbolic notation back', () => {
    expect(toOctal(symbolic('rwxr-xr-x'))).toBe('755')
    expect(toOctal(symbolic('rw-r--r--'))).toBe('644')
  })

  it('ignores the file type character in front', () => {
    expect(toOctal(symbolic('-rw-r--r--'))).toBe('644')
    expect(toOctal(symbolic('drwxr-xr-x'))).toBe('755')
  })

  it('handles setuid, setgid and the sticky bit', () => {
    expect(toSymbolic(octal('4755'))).toBe('rwsr-xr-x')
    expect(toSymbolic(octal('2755'))).toBe('rwxr-sr-x')
    expect(toSymbolic(octal('1777'))).toBe('rwxrwxrwt')
    expect(toOctal(symbolic('rwsr-xr-x'))).toBe('4755')
    expect(toOctal(symbolic('rwxrwxrwt'))).toBe('1777')
  })

  it('uses a capital letter when the special bit is set without execute', () => {
    // chmod 4644 gives "rwSr--r--": setuid is on, but the owner cannot execute.
    expect(toSymbolic(octal('4644'))).toBe('rwSr--r--')
    expect(toOctal(symbolic('rwSr--r--'))).toBe('4644')
  })

  it('round-trips every octal value', () => {
    for (let value = 0; value <= 0o777; value += 1) {
      const text = value.toString(8).padStart(3, '0')
      expect(toOctal(symbolic(toSymbolic(octal(text))))).toBe(String(value === 0 ? '000' : text))
    }
  })

  it('rejects nonsense', () => {
    expect(parseOctal('888')).toEqual({ ok: false, error: 'error.invalidPermissions' })
    expect(parseOctal('75')).toEqual({ ok: false, error: 'error.invalidPermissions' })
    expect(parseSymbolic('rwxrwx')).toEqual({ ok: false, error: 'error.invalidPermissions' })
    expect(parseOctal('')).toEqual({ ok: false, error: 'error.emptyInput' })
  })
})
