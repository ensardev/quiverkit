import { err, ok, type Result } from '../result.js'

/** Tags that never have a closing partner, so they must not open a level. */
const VOID_TAGS = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
  'link', 'meta', 'param', 'source', 'track', 'wbr',
])

interface Node {
  raw: string
  kind: 'open' | 'close' | 'selfClosing' | 'declaration' | 'comment' | 'text'
  name: string
}

function classify(chunk: string): Node {
  if (!chunk.startsWith('<')) return { raw: chunk, kind: 'text', name: '' }
  if (chunk.startsWith('<!--')) return { raw: chunk, kind: 'comment', name: '' }
  if (chunk.startsWith('<?') || chunk.startsWith('<!')) {
    return { raw: chunk, kind: 'declaration', name: '' }
  }

  const name = (/^<\/?\s*([^\s/>]+)/.exec(chunk)?.[1] ?? '').toLowerCase()

  if (chunk.startsWith('</')) return { raw: chunk, kind: 'close', name }
  if (chunk.endsWith('/>') || VOID_TAGS.has(name)) return { raw: chunk, kind: 'selfClosing', name }

  return { raw: chunk, kind: 'open', name }
}

function split(markup: string): Node[] {
  const nodes: Node[] = []
  let index = 0

  while (index < markup.length) {
    if (markup[index] === '<') {
      const end = markup.startsWith('<!--', index)
        ? markup.indexOf('-->', index) + 3
        : markup.indexOf('>', index) + 1

      if (end <= 0) break
      nodes.push(classify(markup.slice(index, end)))
      index = end
      continue
    }

    const next = markup.indexOf('<', index)
    const text = markup.slice(index, next === -1 ? undefined : next).trim()
    if (text !== '') nodes.push(classify(text))
    if (next === -1) break
    index = next
  }

  return nodes
}

export function formatXml(markup: string, indentSize = 2): Result<string> {
  if (markup.trim() === '') return err('error.emptyInput')

  const nodes = split(markup)
  if (nodes.length === 0) return err('error.invalidXml')

  const lines: string[] = []
  let depth = 0

  for (let index = 0; index < nodes.length; index += 1) {
    const node = nodes[index] as Node

    if (node.kind === 'close') depth -= 1

    const pad = ' '.repeat(Math.max(0, depth) * indentSize)

    // An element whose only child is text reads better on one line:
    // <title>Hello</title> rather than three separate lines.
    const next = nodes[index + 1]
    const after = nodes[index + 2]
    if (
      node.kind === 'open' &&
      next?.kind === 'text' &&
      after?.kind === 'close' &&
      after.name === node.name
    ) {
      lines.push(`${pad}${node.raw}${next.raw}${after.raw}`)
      index += 2
      continue
    }

    lines.push(pad + node.raw)
    if (node.kind === 'open') depth += 1
  }

  return ok(lines.join('\n'))
}

export function minifyXml(markup: string): Result<string> {
  if (markup.trim() === '') return err('error.emptyInput')

  return ok(
    split(markup)
      .map((node) => node.raw)
      .join(''),
  )
}
