import { err, ok, type Result } from '../result.js'

/** Strips HTML tags and decodes common entities, returning plain text. */
export function stripHtml(input: string): Result<string> {
  const trimmed = input.trim()
  if (trimmed === '') return err('error.emptyInput')

  // Remove <style>, <script> and their contents.
  let text = trimmed.replace(/<(style|script)\b[^>]*>[\s\S]*?<\/\1>/gi, '')

  // Replace block-level tags with newlines so the output keeps paragraph breaks.
  text = text.replace(/<\/?(div|p|h[1-6]|li|tr|article|section|header|footer|nav|main|aside|blockquote|pre|table|ul|ol|dl|hr|br|figure|figcaption|details|summary|fieldset|form|option)[^>]*>/gi, '\n')

  // Remove all remaining tags.
  text = text.replace(/<[^>]*>/g, '')

  // Decode common HTML entities.
  text = text.replace(/&amp;/g, '&')
  text = text.replace(/&lt;/g, '<')
  text = text.replace(/&gt;/g, '>')
  text = text.replace(/&quot;/g, '"')
  text = text.replace(/&#39;/g, "'")
  text = text.replace(/&nbsp;/g, ' ')

  // Decode numeric entities (decimal and hex).
  text = text.replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number(dec)))
  text = text.replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))

  // Collapse whitespace: multiple blanks → one, multiple newlines → two at most.
  text = text.replace(/[ \t]+/g, ' ')
  text = text.replace(/\n{3,}/g, '\n\n')

  return ok(text.trim())
}
