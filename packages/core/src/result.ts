/**
 * Every tool returns a Result instead of throwing.
 *
 * `error` is an i18n key, never a human sentence: core logic is shared by the
 * web app, the desktop build and (later) the CLI, and each of those decides how
 * to render the message in the user's own language.
 */

export type ToolError =
  | 'error.emptyInput'
  | 'error.invalidBase64'
  | 'error.invalidUtf8'
  | 'error.invalidJson'
  | 'error.invalidJwt'
  | 'error.invalidUrlEncoding'
  | 'error.invalidTimestamp'
  | 'error.noCharacterSet'
  | 'error.invalidColor'

export type Result<T> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: ToolError }

export function ok<T>(value: T): Result<T> {
  return { ok: true, value }
}

export function err<T = never>(error: ToolError): Result<T> {
  return { ok: false, error }
}
