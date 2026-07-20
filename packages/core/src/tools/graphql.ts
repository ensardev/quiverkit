import { err, ok, type Result } from '../result.js'

/**
 * Formats a GraphQL document (query, mutation, subscription, or SDL) with
 * consistent indentation.  It is intentionally simple: it handles the 95% use
 * case without a full parser, and it does not rearrange or validate the document.
 */
export function formatGraphql(input: string, indent = 2): Result<string> {
  const trimmed = input.trim()
  if (trimmed === '') return err('error.emptyInput')

  const spaces = ' '.repeat(indent)
  let level = 0
  const output: string[] = []
  let i = 0
  let pendingNewline = false

  function push(ch: string): void {
    if (pendingNewline) {
      output.push('\n')
      output.push(spaces.repeat(level))
      pendingNewline = false
    }
    output.push(ch)
  }

  function newline(): void {
    pendingNewline = true
  }

  function advance(n: number): void {
    i += n
  }

  while (i < trimmed.length) {
    const ch = trimmed[i] as string

    // Whitespace — collapse to at most one space.
    if (ch === ' ' || ch === '\t' || ch === '\r' || ch === '\n' || ch === ',') {
      advance(1)
      // Comma is optional in GraphQL but sometimes present.
      if (ch === '\n') newline()
      continue
    }

    // Comments
    if (ch === '#') {
      push('#')
      advance(1)
      while (i < trimmed.length && trimmed[i] !== '\n') {
        push(trimmed[i] as string)
        advance(1)
      }
      newline()
      continue
    }

    // Strings (single-line and block)
    if (ch === '"') {
      advance(1)
      if (trimmed[i] === '"' && trimmed[i + 1] === '"') {
        // Block string
        push('"""')
        advance(2)
        while (i < trimmed.length) {
          if (trimmed[i] === '"' && trimmed[i + 1] === '"' && trimmed[i + 2] === '"') {
            push('"""')
            advance(3)
            break
          }
          push(trimmed[i] as string)
          advance(1)
        }
      } else {
        push('"')
        while (i < trimmed.length) {
          if (trimmed[i] === '"' && trimmed[i - 1] !== '\\') {
            push('"')
            advance(1)
            break
          }
          push(trimmed[i] as string)
          advance(1)
        }
      }
      continue
    }

    // Opening brace — only { starts a new indented block.
    if (ch === '{') {
      push(' ')
      push(ch)
      level++
      advance(1)
      newline()
      continue
    }

    // Parentheses and brackets — inline.
    if (ch === '(' || ch === '[') {
      push(ch)
      advance(1)
      continue
    }

    // Closing brace — unindent.
    if (ch === '}') {
      level = Math.max(0, level - 1)
      newline()
      push(ch)
      advance(1)
      continue
    }

    // Closing parens and brackets — inline.
    if (ch === ')' || ch === ']') {
      push(ch)
      advance(1)
      continue
    }

    // Colon
    if (ch === ':') {
      push(':')
      push(' ')
      advance(1)
      continue
    }

    // Pipe (union types)
    if (ch === '|') {
      push(' ')
      push('|')
      push(' ')
      advance(1)
      continue
    }

    // Equals (default values)
    if (ch === '=') {
      push(' ')
      push('=')
      push(' ')
      advance(1)
      continue
    }

    // Bang (!)
    if (ch === '!') {
      push('!')
      advance(1)
      continue
    }

    // Spread (...)
    if (ch === '.' && trimmed[i + 1] === '.' && trimmed[i + 2] === '.') {
      push('...')
      advance(3)
      if (i < trimmed.length && trimmed[i] === ' ') push(' ')
      continue
    }

    // All other characters
    push(ch)
    advance(1)
  }

  // Flush pending newline.
  if (pendingNewline) {
    output.push('\n')
    pendingNewline = false
  }

  return ok(output.join('').replace(/\n\s*\n/g, '\n'))
}

/** Removes all non-essential whitespace from a GraphQL document. */
export function minifyGraphql(input: string): Result<string> {
  const trimmed = input.trim()
  if (trimmed === '') return err('error.emptyInput')

  let result = ''
  let i = 0
  let prev = ''

  function push(ch: string): void {
    if (ch === ' ' && (prev === ' ' || prev === '{' || prev === '(' || prev === '\n')) return
    if (ch === '\n' && prev === '\n') return
    result += ch
    prev = ch
  }

  while (i < trimmed.length) {
    const ch = trimmed[i] as string

    // Skip comments
    if (ch === '#') {
      advance(1)
      while (i < trimmed.length && trimmed[i] !== '\n') advance(1)
      continue
    }

    // Strings — preserve verbatim
    if (ch === '"') {
      advance(1)
      push('"')
      if (trimmed[i] === '"' && trimmed[i + 1] === '"') {
        push('"')
        push('"')
        advance(2)
        while (i < trimmed.length) {
          if (trimmed[i] === '"' && trimmed[i + 1] === '"' && trimmed[i + 2] === '"') {
            push('"""')
            advance(3)
            break
          }
          push(trimmed[i] as string)
          advance(1)
        }
      } else {
        while (i < trimmed.length) {
          if (trimmed[i] === '"' && trimmed[i - 1] !== '\\') {
            push('"')
            advance(1)
            break
          }
          push(trimmed[i] as string)
          advance(1)
        }
      }
      continue
    }

    // Whitespace
    if (ch === ' ' || ch === '\t' || ch === '\r' || ch === '\n' || ch === ',') {
      advance(1)
      if (needsSpace(prev) && needsSpace(trimmed[i] ?? '') && prev !== ' ' && trimmed[i] !== ' ') {
        push(' ')
      }
      continue
    }

    push(ch)
    advance(1)
  }

  return ok(result.trim().replace(/\s+([)}\]])/g, '$1'))

  function advance(n: number): void {
    i += n
  }
}

function needsSpace(ch: string): boolean {
  if (ch === '') return false
  return /[a-zA-Z0-9_!"$)\]}]/.test(ch)
}
