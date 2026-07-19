export type StatusClass = 'informational' | 'success' | 'redirect' | 'clientError' | 'serverError'

export interface HttpStatus {
  code: number
  /** The reason phrase from the RFC, which is defined in English and stays so. */
  phrase: string
  group: StatusClass
}

const PHRASES: [number, string][] = [
  [100, 'Continue'], [101, 'Switching Protocols'], [103, 'Early Hints'],
  [200, 'OK'], [201, 'Created'], [202, 'Accepted'], [204, 'No Content'], [206, 'Partial Content'],
  [301, 'Moved Permanently'], [302, 'Found'], [303, 'See Other'], [304, 'Not Modified'],
  [307, 'Temporary Redirect'], [308, 'Permanent Redirect'],
  [400, 'Bad Request'], [401, 'Unauthorized'], [402, 'Payment Required'], [403, 'Forbidden'],
  [404, 'Not Found'], [405, 'Method Not Allowed'], [406, 'Not Acceptable'],
  [408, 'Request Timeout'], [409, 'Conflict'], [410, 'Gone'], [412, 'Precondition Failed'],
  [413, 'Content Too Large'], [415, 'Unsupported Media Type'], [418, "I'm a teapot"],
  [422, 'Unprocessable Content'], [425, 'Too Early'], [428, 'Precondition Required'],
  [429, 'Too Many Requests'], [431, 'Request Header Fields Too Large'],
  [451, 'Unavailable For Legal Reasons'],
  [500, 'Internal Server Error'], [501, 'Not Implemented'], [502, 'Bad Gateway'],
  [503, 'Service Unavailable'], [504, 'Gateway Timeout'], [507, 'Insufficient Storage'],
  [511, 'Network Authentication Required'],
]

function groupOf(code: number): StatusClass {
  if (code < 200) return 'informational'
  if (code < 300) return 'success'
  if (code < 400) return 'redirect'
  if (code < 500) return 'clientError'
  return 'serverError'
}

export const HTTP_STATUSES: HttpStatus[] = PHRASES.map(([code, phrase]) => ({
  code,
  phrase,
  group: groupOf(code),
}))

export interface MimeType {
  type: string
  extensions: string[]
}

export const MIME_TYPES: MimeType[] = [
  { type: 'application/json', extensions: ['json'] },
  { type: 'application/ld+json', extensions: ['jsonld'] },
  { type: 'application/xml', extensions: ['xml'] },
  { type: 'application/pdf', extensions: ['pdf'] },
  { type: 'application/zip', extensions: ['zip'] },
  { type: 'application/gzip', extensions: ['gz'] },
  { type: 'application/wasm', extensions: ['wasm'] },
  { type: 'application/octet-stream', extensions: ['bin'] },
  { type: 'application/x-www-form-urlencoded', extensions: [] },
  { type: 'multipart/form-data', extensions: [] },
  { type: 'text/plain', extensions: ['txt'] },
  { type: 'text/html', extensions: ['html', 'htm'] },
  { type: 'text/css', extensions: ['css'] },
  { type: 'text/csv', extensions: ['csv'] },
  { type: 'text/markdown', extensions: ['md'] },
  { type: 'text/event-stream', extensions: [] },
  { type: 'text/javascript', extensions: ['js', 'mjs'] },
  { type: 'image/png', extensions: ['png'] },
  { type: 'image/jpeg', extensions: ['jpg', 'jpeg'] },
  { type: 'image/gif', extensions: ['gif'] },
  { type: 'image/webp', extensions: ['webp'] },
  { type: 'image/avif', extensions: ['avif'] },
  { type: 'image/svg+xml', extensions: ['svg'] },
  { type: 'image/x-icon', extensions: ['ico'] },
  { type: 'audio/mpeg', extensions: ['mp3'] },
  { type: 'audio/ogg', extensions: ['ogg'] },
  { type: 'audio/wav', extensions: ['wav'] },
  { type: 'video/mp4', extensions: ['mp4'] },
  { type: 'video/webm', extensions: ['webm'] },
  { type: 'font/woff2', extensions: ['woff2'] },
  { type: 'font/ttf', extensions: ['ttf'] },
]

export function findStatuses(query: string): HttpStatus[] {
  const needle = query.trim().toLowerCase()
  if (needle === '') return HTTP_STATUSES

  return HTTP_STATUSES.filter(
    (status) => String(status.code).includes(needle) || status.phrase.toLowerCase().includes(needle),
  )
}

export function findMimeTypes(query: string): MimeType[] {
  const needle = query.trim().toLowerCase().replace(/^\./, '')
  if (needle === '') return MIME_TYPES

  return MIME_TYPES.filter(
    (mime) =>
      mime.type.toLowerCase().includes(needle) ||
      mime.extensions.some((extension) => extension.includes(needle)),
  )
}
