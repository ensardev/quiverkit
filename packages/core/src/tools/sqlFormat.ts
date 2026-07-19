const MAJOR_CLAUSES = [
  'SELECT', 'FROM', 'WHERE', 'GROUP BY', 'HAVING', 'ORDER BY', 'LIMIT', 'OFFSET',
  'INSERT INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE FROM', 'RETURNING',
  'UNION ALL', 'UNION', 'INTERSECT', 'EXCEPT', 'WITH',
]

const JOINS = ['LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 'FULL JOIN', 'CROSS JOIN', 'JOIN']

const KEYWORDS = new Set([
  ...MAJOR_CLAUSES.flatMap((clause) => clause.split(' ')),
  ...JOINS.flatMap((join) => join.split(' ')),
  'AND', 'OR', 'NOT', 'IN', 'IS', 'NULL', 'AS', 'ON', 'DISTINCT', 'CASE', 'WHEN',
  'THEN', 'ELSE', 'END', 'ASC', 'DESC', 'BETWEEN', 'LIKE', 'ILIKE', 'EXISTS',
  'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'COALESCE', 'CAST', 'TRUE', 'FALSE',
])

interface Token {
  value: string
  kind: 'word' | 'string' | 'punctuation' | 'comment'
}

/**
 * Strings and comments are tokenised separately so their contents are never
 * treated as SQL — uppercasing a keyword that happens to appear inside a
 * literal would silently change what the query does.
 */
function tokenise(sql: string): Token[] {
  const tokens: Token[] = []
  let index = 0

  while (index < sql.length) {
    const character = sql[index] as string

    if (/\s/.test(character)) {
      index += 1
      continue
    }

    if (character === '-' && sql[index + 1] === '-') {
      const end = sql.indexOf('\n', index)
      tokens.push({ value: sql.slice(index, end === -1 ? undefined : end), kind: 'comment' })
      index = end === -1 ? sql.length : end
      continue
    }

    if (character === "'" || character === '"' || character === '`') {
      let end = index + 1
      while (end < sql.length && sql[end] !== character) end += 1
      tokens.push({ value: sql.slice(index, end + 1), kind: 'string' })
      index = end + 1
      continue
    }

    if (/[(),;]/.test(character)) {
      tokens.push({ value: character, kind: 'punctuation' })
      index += 1
      continue
    }

    let end = index
    while (end < sql.length && !/[\s(),;'"`]/.test(sql[end] as string)) end += 1
    tokens.push({ value: sql.slice(index, end), kind: 'word' })
    index = end
  }

  return tokens
}

export function formatSql(sql: string, indentSize = 2): string {
  if (sql.trim() === '') return ''

  const tokens = tokenise(sql)
  const lines: string[] = []
  let current = ''
  let depth = 0

  const indent = () => ' '.repeat(Math.max(0, depth) * indentSize)
  const flush = () => {
    if (current.trim() !== '') lines.push(indent() + current.trim())
    current = ''
  }

  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index] as Token
    const upper = token.value.toUpperCase()

    if (token.kind === 'word') {
      const twoWord = `${upper} ${(tokens[index + 1]?.value ?? '').toUpperCase()}`
      const clause = MAJOR_CLAUSES.includes(twoWord)
        ? twoWord
        : MAJOR_CLAUSES.includes(upper)
          ? upper
          : null
      const join = JOINS.includes(twoWord) ? twoWord : JOINS.includes(upper) ? upper : null

      if (clause || join) {
        flush()
        current = clause ?? (join as string)
        if (clause?.includes(' ') || join?.includes(' ')) index += 1
        continue
      }

      if (upper === 'AND' || upper === 'OR') {
        flush()
        depth += 1
        current = upper
        depth -= 1
        continue
      }

      current += `${current === '' ? '' : ' '}${KEYWORDS.has(upper) ? upper : token.value}`
      continue
    }

    if (token.kind === 'punctuation') {
      if (token.value === ',') {
        current += ','
        continue
      }
      if (token.value === '(') {
        current += `${current.endsWith(' ') || current === '' ? '' : ' '}(`
        depth += 1
        continue
      }
      if (token.value === ')') {
        depth -= 1
        current += ')'
        continue
      }
      if (token.value === ';') {
        current += ';'
        flush()
        continue
      }
    }

    current += `${current === '' ? '' : ' '}${token.value}`
  }

  flush()
  return lines.join('\n')
}

export function minifySql(sql: string): string {
  return tokenise(sql)
    .filter((token) => token.kind !== 'comment')
    .map((token) => token.value)
    .join(' ')
    .replace(/\s+([,;)])/g, '$1')
    .replace(/\(\s+/g, '(')
    .trim()
}
