import { describe, expect, it } from 'vitest'
import { compareSemver, parseSemver, satisfies, sortVersions } from './semver.js'

function version(input: string) {
  const result = parseSemver(input)
  if (!result.ok) throw new Error(`expected ${input} to parse`)
  return result.value
}

const order = (left: string, right: string) => Math.sign(compareSemver(version(left), version(right)))

describe('parseSemver', () => {
  it('reads the parts', () => {
    expect(version('1.2.3')).toMatchObject({ major: 1, minor: 2, patch: 3 })
    expect(version('v2.0.0')).toMatchObject({ major: 2 })
    expect(version('1.0.0-rc.1+build.5')).toMatchObject({
      prerelease: ['rc', '1'],
      build: ['build', '5'],
    })
  })

  it('rejects incomplete versions', () => {
    expect(parseSemver('1.2')).toEqual({ ok: false, error: 'error.invalidVersion' })
    expect(parseSemver('one.two.three')).toEqual({ ok: false, error: 'error.invalidVersion' })
    expect(parseSemver('')).toEqual({ ok: false, error: 'error.emptyInput' })
  })
})

describe('compareSemver', () => {
  it('orders by major, minor and patch', () => {
    expect(order('1.0.0', '2.0.0')).toBe(-1)
    expect(order('1.2.0', '1.10.0')).toBe(-1)
    expect(order('1.0.1', '1.0.0')).toBe(1)
    expect(order('1.0.0', '1.0.0')).toBe(0)
  })

  it('ranks a prerelease below the release it leads to', () => {
    expect(order('1.0.0-rc.1', '1.0.0')).toBe(-1)
  })

  it('follows the spec order for prerelease identifiers', () => {
    // alpha < alpha.1 < alpha.beta < beta, and numbers rank below words.
    expect(order('1.0.0-alpha', '1.0.0-alpha.1')).toBe(-1)
    expect(order('1.0.0-alpha.1', '1.0.0-alpha.beta')).toBe(-1)
    expect(order('1.0.0-alpha.beta', '1.0.0-beta')).toBe(-1)
    expect(order('1.0.0-rc.2', '1.0.0-rc.10')).toBe(-1)
  })

  it('ignores build metadata', () => {
    expect(order('1.0.0+a', '1.0.0+b')).toBe(0)
  })

  it('sorts a list oldest first', () => {
    const sorted = sortVersions(['2.0.0', '1.0.0-rc.1', '1.0.0', '1.10.0'].map(version))
    expect(sorted.map((entry) => entry.raw)).toEqual(['1.0.0-rc.1', '1.0.0', '1.10.0', '2.0.0'])
  })
})

describe('satisfies', () => {
  const check = (v: string, range: string) => {
    const result = satisfies(version(v), range)
    if (!result.ok) throw new Error(`expected ${range} to be a valid range`)
    return result.value
  }

  it('handles exact versions', () => {
    expect(check('1.2.3', '1.2.3')).toBe(true)
    expect(check('1.2.4', '1.2.3')).toBe(false)
  })

  it('handles caret, which keeps the leftmost non-zero digit', () => {
    expect(check('1.5.0', '^1.2.3')).toBe(true)
    expect(check('2.0.0', '^1.2.3')).toBe(false)
    expect(check('0.2.9', '^0.2.3')).toBe(true)
    expect(check('0.3.0', '^0.2.3')).toBe(false)
  })

  it('handles tilde, which allows patch updates only', () => {
    expect(check('1.2.9', '~1.2.3')).toBe(true)
    expect(check('1.3.0', '~1.2.3')).toBe(false)
  })

  it('handles comparison operators', () => {
    expect(check('2.0.0', '>1.0.0')).toBe(true)
    expect(check('1.0.0', '>=1.0.0')).toBe(true)
    expect(check('0.9.0', '<1.0.0')).toBe(true)
    expect(check('1.0.1', '<=1.0.0')).toBe(false)
  })

  it('handles wildcards', () => {
    expect(check('1.2.9', '1.2.x')).toBe(true)
    expect(check('1.3.0', '1.2.x')).toBe(false)
    expect(check('1.9.9', '1.x')).toBe(true)
    expect(check('9.9.9', '*')).toBe(true)
  })

  it('combines comparators with and, and alternatives with or', () => {
    expect(check('1.5.0', '>=1.0.0 <2.0.0')).toBe(true)
    expect(check('2.5.0', '>=1.0.0 <2.0.0')).toBe(false)
    expect(check('2.5.0', '^1.0.0 || ^2.0.0')).toBe(true)
  })

  it('reports a range it cannot read', () => {
    expect(satisfies(version('1.0.0'), '>=banana')).toEqual({ ok: false, error: 'error.invalidRange' })
  })
})
