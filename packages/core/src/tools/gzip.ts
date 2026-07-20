import { err, ok, type Result } from '../result.js'

export type CompressionFormat = 'gzip' | 'deflate' | 'deflate-raw'

export interface CompressionResult {
  /** Base64-encoded compressed data. */
  base64: string
  /** Original byte count. */
  originalBytes: number
  /** Compressed byte count. */
  compressedBytes: number
  /** Compressed / original (lower is better). */
  ratio: number
}

/**
 * Compresses text with the browser's built-in CompressionStream.  The result is
 * base64-encoded so it can be copied, and the caller gets original vs compressed
 * sizes for the inevitable "wow, X% smaller" moment.
 */
export async function compressText(
  input: string,
  format: CompressionFormat = 'gzip',
): Promise<Result<CompressionResult>> {
  const trimmed = input.trim()
  if (trimmed === '') return err('error.emptyInput')

  const encoder = new TextEncoder()
  const original = encoder.encode(trimmed)

  try {
    const stream = new Blob([original])
      .stream()
      .pipeThrough(new CompressionStream(format))

    const chunks: Uint8Array[] = []
    const reader = stream.getReader()
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      if (value) chunks.push(value)
    }

    const compressed = new Uint8Array(chunks.reduce((sum, c) => sum + c.length, 0))
    let offset = 0
    for (const chunk of chunks) {
      compressed.set(chunk, offset)
      offset += chunk.length
    }

    const base64 = btoa(String.fromCharCode(...compressed))
    const ratio = compressed.length / original.length

    return ok({
      base64,
      originalBytes: original.length,
      compressedBytes: compressed.length,
      ratio,
    })
  } catch {
    return err('error.emptyInput')
  }
}

/**
 * Decompresses a base64-encoded compressed payload.  The inverse of compressText.
 */
export async function decompressText(
  base64: string,
  format: CompressionFormat = 'gzip',
): Promise<Result<string>> {
  const trimmed = base64.trim()
  if (trimmed === '') return err('error.emptyInput')

  try {
    const binary = atob(trimmed)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)

    const stream = new Blob([bytes])
      .stream()
      .pipeThrough(new DecompressionStream(format))

    const chunks: Uint8Array[] = []
    const reader = stream.getReader()
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      if (value) chunks.push(value)
    }

    const decoder = new TextDecoder()
    let text = ''
    for (const chunk of chunks) text += decoder.decode(chunk, { stream: true })
    text += decoder.decode()

    return ok(text)
  } catch {
    return err('error.emptyInput')
  }
}
