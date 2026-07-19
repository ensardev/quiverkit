import { err, ok, type Result } from '../result.js'

export interface Header {
  key: string
  value: string
}

export interface HttpRequest {
  method: string
  url: string
  headers: Header[]
  body: string | undefined
}

export const CODE_TARGETS = ['fetch', 'axios', 'python', 'go'] as const

export type CodeTarget = (typeof CODE_TARGETS)[number]

/**
 * Splits a command the way a shell would: quotes group words, a backslash before
 * a newline continues the line, and everything inside single quotes is literal.
 */
function tokenise(command: string): string[] {
  const tokens: string[] = []
  let current = ''
  let quote: '"' | "'" | null = null
  let started = false

  for (let index = 0; index < command.length; index += 1) {
    const character = command[index] as string

    if (quote) {
      if (character === quote) quote = null
      else if (character === '\\' && quote === '"') {
        index += 1
        current += command[index] ?? ''
      } else current += character
      continue
    }

    if (character === '"' || character === "'") {
      quote = character
      started = true
      continue
    }

    if (character === '\\' && command[index + 1] === '\n') {
      index += 1
      continue
    }

    if (/\s/.test(character)) {
      if (current !== '' || started) tokens.push(current)
      current = ''
      started = false
      continue
    }

    current += character
  }

  if (current !== '' || started) tokens.push(current)

  return tokens
}

export function parseCurl(command: string): Result<HttpRequest> {
  const trimmed = command.trim()
  if (trimmed === '') return err('error.emptyInput')

  const tokens = tokenise(trimmed)
  if (tokens[0] !== 'curl') return err('error.invalidCurl')

  const request: HttpRequest = { method: '', url: '', headers: [], body: undefined }

  for (let index = 1; index < tokens.length; index += 1) {
    const token = tokens[index] as string
    const next = () => tokens[(index += 1)] ?? ''

    switch (token) {
      case '-X':
      case '--request':
        request.method = next().toUpperCase()
        break
      case '-H':
      case '--header': {
        const raw = next()
        const separator = raw.indexOf(':')
        if (separator > 0) {
          request.headers.push({
            key: raw.slice(0, separator).trim(),
            value: raw.slice(separator + 1).trim(),
          })
        }
        break
      }
      case '-d':
      case '--data':
      case '--data-raw':
      case '--data-binary':
        request.body = next()
        break
      case '-u':
      case '--user': {
        const credentials = next()
        request.headers.push({ key: 'Authorization', value: `Basic ${btoa(credentials)}` })
        break
      }
      case '-A':
      case '--user-agent':
        request.headers.push({ key: 'User-Agent', value: next() })
        break
      default:
        // Flags we do not model (-L, -k, --compressed…) are skipped; anything
        // else that is not a flag is the URL.
        if (!token.startsWith('-') && request.url === '') request.url = token
    }
  }

  if (request.url === '') return err('error.invalidCurl')
  if (request.method === '') request.method = request.body === undefined ? 'GET' : 'POST'

  return ok(request)
}

function quote(value: string): string {
  return JSON.stringify(value)
}

function headerObject(headers: Header[], indent: string): string {
  if (headers.length === 0) return '{}'
  const lines = headers.map((header) => `${indent}  ${quote(header.key)}: ${quote(header.value)},`)
  return `{\n${lines.join('\n')}\n${indent}}`
}

export function generateCode(request: HttpRequest, target: CodeTarget): string {
  const { method, url, headers, body } = request

  switch (target) {
    case 'fetch': {
      const options = [`  method: ${quote(method)}`]
      if (headers.length > 0) options.push(`  headers: ${headerObject(headers, '  ')}`)
      if (body !== undefined) options.push(`  body: ${quote(body)}`)

      return `const response = await fetch(${quote(url)}, {\n${options.join(',\n')},\n})\n\nconst data = await response.json()`
    }

    case 'axios': {
      const options = [`  method: ${quote(method.toLowerCase())}`, `  url: ${quote(url)}`]
      if (headers.length > 0) options.push(`  headers: ${headerObject(headers, '  ')}`)
      if (body !== undefined) options.push(`  data: ${quote(body)}`)

      return `import axios from 'axios'\n\nconst { data } = await axios({\n${options.join(',\n')},\n})`
    }

    case 'python': {
      const lines = ['import requests', '']
      if (headers.length > 0) {
        lines.push('headers = {')
        for (const header of headers) lines.push(`    ${quote(header.key)}: ${quote(header.value)},`)
        lines.push('}', '')
      }
      if (body !== undefined) lines.push(`data = ${quote(body)}`, '')

      const args = [quote(url)]
      if (headers.length > 0) args.push('headers=headers')
      if (body !== undefined) args.push('data=data')

      lines.push(`response = requests.${method.toLowerCase()}(${args.join(', ')})`, 'print(response.json())')
      return lines.join('\n')
    }

    case 'go': {
      const lines = [
        'package main',
        '',
        'import (',
        '\t"fmt"',
        '\t"io"',
        '\t"net/http"',
        body !== undefined ? '\t"strings"' : '',
        ')',
        '',
        'func main() {',
      ].filter((line) => line !== '')

      const reader = body === undefined ? 'nil' : `strings.NewReader(${quote(body)})`
      lines.push(`\treq, err := http.NewRequest(${quote(method)}, ${quote(url)}, ${reader})`)
      lines.push('\tif err != nil {', '\t\tpanic(err)', '\t}')

      for (const header of headers) {
        lines.push(`\treq.Header.Set(${quote(header.key)}, ${quote(header.value)})`)
      }

      lines.push(
        '',
        '\tresp, err := http.DefaultClient.Do(req)',
        '\tif err != nil {',
        '\t\tpanic(err)',
        '\t}',
        '\tdefer resp.Body.Close()',
        '',
        '\tbody, _ := io.ReadAll(resp.Body)',
        '\tfmt.Println(string(body))',
        '}',
      )

      return lines.join('\n')
    }
  }
}
