import { marked } from 'marked'
import { err, ok, type Result } from '../result.js'

/** Renders Markdown to HTML using the `marked` library. */
export function renderMarkdown(input: string): Result<string> {
  const trimmed = input.trim()
  if (trimmed === '') return err('error.emptyInput')

  const html = marked.parse(trimmed, { async: false }) as string
  return ok(html)
}
