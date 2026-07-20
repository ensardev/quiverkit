import { useCallback, useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Encoded into the URL fragment rather than the query string, because a
 * fragment is never sent to a server — not in the request line, not in logs,
 * not in a referrer header. That is what makes a shareable link compatible with
 * the promise that nothing leaves your machine.
 */
const PARAM = 'v'

function encode(value: string): string {
  const bytes = new TextEncoder().encode(value)
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)

  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '')
}

function decode(value: string): string | null {
  const restored = value.replaceAll('-', '+').replaceAll('_', '/')

  try {
    const binary = atob(restored + '='.repeat((4 - (restored.length % 4)) % 4))
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0))
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes)
  } catch {
    return null
  }
}

function readFragment(): string | null {
  const hash = window.location.hash.replace(/^#/, '')
  if (hash === '') return null

  const value = new URLSearchParams(hash).get(PARAM)
  return value === null ? null : decode(value)
}

export interface ToolInput {
  value: string
  setValue: (next: string) => void
  /** Writes the current value into the address bar and returns the link. */
  share: () => string
}

/**
 * One place for the two ways a tool can be handed something to work on: a
 * shared link, or the detector saying "this is a JWT, here it is".
 */
export function useToolInput(initial = ''): ToolInput {
  const location = useLocation()

  const [value, setValue] = useState(() => {
    const fromLink = readFragment()
    if (fromLink !== null) return fromLink

    const handed = (location.state as { detectedInput?: unknown } | null)?.detectedInput
    return typeof handed === 'string' ? handed : initial
  })

  // Arriving from the detector while already on the page — the component stays
  // mounted, so only the router state changes.
  useEffect(() => {
    const handed = (location.state as { detectedInput?: unknown } | null)?.detectedInput
    if (typeof handed === 'string' && handed !== '') setValue(handed)
  }, [location.state, location.key])

  const share = useCallback(() => {
    const url = new URL(window.location.href)
    url.hash = value === '' ? '' : `${PARAM}=${encode(value)}`

    // `replaceState` rather than a navigation: sharing should not add a history
    // entry the user then has to press back through.
    window.history.replaceState(null, '', url.toString())
    return url.toString()
  }, [value])

  return { value, setValue, share }
}
