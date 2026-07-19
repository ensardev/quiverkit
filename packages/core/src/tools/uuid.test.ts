import { describe, expect, it } from 'vitest'
import { generateNanoId, generateUuidV4, generateUuidV7 } from './uuid.js'

const UUID_SHAPE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/

describe('uuid', () => {
  it('generates well-formed v4 ids', () => {
    const id = generateUuidV4()
    expect(id).toMatch(UUID_SHAPE)
    expect(id[14]).toBe('4')
  })

  it('generates well-formed v7 ids', () => {
    const id = generateUuidV7()
    expect(id).toMatch(UUID_SHAPE)
    expect(id[14]).toBe('7')
    expect('89ab').toContain(id[19])
  })

  it('keeps v7 ids chronologically sortable', () => {
    const ids = Array.from({ length: 50 }, generateUuidV7)
    expect([...ids].sort()).toEqual(ids)
  })

  it('generates ids of the requested length', () => {
    expect(generateNanoId()).toHaveLength(21)
    expect(generateNanoId(8)).toHaveLength(8)
  })
})
