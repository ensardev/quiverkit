import { describe, expect, it } from 'vitest'
import { formatSql, minifySql } from './sqlFormat.js'

describe('formatSql', () => {
  it('puts each major clause on its own line', () => {
    const lines = formatSql('select id, name from users where age > 18 order by name').split('\n')
    expect(lines).toEqual([
      'SELECT id, name',
      'FROM users',
      'WHERE age > 18',
      'ORDER BY name',
    ])
  })

  it('uppercases keywords but leaves identifiers alone', () => {
    expect(formatSql('select MyColumn from MyTable')).toContain('SELECT MyColumn')
    expect(formatSql('select MyColumn from MyTable')).toContain('FROM MyTable')
  })

  it('breaks joins and boolean operators onto their own lines', () => {
    const output = formatSql('select * from a left join b on a.id = b.id where x = 1 and y = 2')
    expect(output).toContain('LEFT JOIN b')
    expect(output.split('\n').some((line) => line.trim().startsWith('AND'))).toBe(true)
  })

  it('never touches the inside of a string literal', () => {
    // "from" here is data, not a clause, and must survive untouched.
    expect(formatSql(`select 'a from b' as note`)).toContain(`'a from b'`)
  })

  it('keeps comments', () => {
    expect(formatSql('select 1 -- a note')).toContain('-- a note')
  })

  it('returns empty output for empty input', () => {
    expect(formatSql('   ')).toBe('')
  })
})

describe('minifySql', () => {
  it('collapses the query onto one line and drops comments', () => {
    expect(minifySql('SELECT id\nFROM users -- note\nWHERE id = 1;')).toBe(
      'SELECT id FROM users WHERE id = 1;',
    )
  })
})
