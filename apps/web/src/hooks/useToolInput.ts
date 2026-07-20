import { useCallback, useEffect, useState } from 'react'
import { useHref, useLocation } from 'react-router-dom'

/**
 * Kept after the '#' rather than in the query string, because a fragment is
 * never sent to a server — not in the request line, not in logs, not in a
 * referrer header. That is what makes a shareable link compatible with the
 * promise that nothing leaves your machine.
 *
 * Where exactly it sits depends on the router, and both apps below the '#':
 *
 *   BrowserRouter (web)          /jwt#v=…
 *   HashRouter (desktop, panel)  #/jwt?v=…
 *
 * The desktop and extension builds route through the fragment, so writing the
 * value there directly used to overwrite the route: the tool vanished from the
 * URL and reloading dropped you back on the home page. Riding along as the
 * route's own query keeps both, and stays after the '#' either way.
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

/**
 * Under hash routing the router has already split the fragment for us, so the
 * value arrives as its `search`. Otherwise the whole fragment is ours to parse.
 */
function readShared(hashRouting: boolean, search: string): string | null {
  const source = hashRouting ? search : window.location.hash.replace(/^#/, '')
  if (source === '') return null

  const value = new URLSearchParams(source).get(PARAM)
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

  // Asking the router what '/' looks like is the honest way to tell the two
  // apart: '#/' under hash routing, '/' otherwise.
  const hashRouting = useHref('/').startsWith('#')

  const [value, setValue] = useState(() => {
    const fromLink = readShared(hashRouting, location.search)
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
    const payload = value === '' ? '' : `${PARAM}=${encode(value)}`

    if (hashRouting) {
      // The route itself lives in the fragment, so the value has to go inside
      // it rather than replace it — otherwise the link forgets which tool.
      url.hash = payload === '' ? location.pathname : `${location.pathname}?${payload}`
    } else {
      url.hash = payload
    }

    // `replaceState` rather than a navigation: sharing should not add a history
    // entry the user then has to press back through.
    window.history.replaceState(null, '', url.toString())
    return url.toString()
  }, [value, hashRouting, location.pathname])

  return { value, setValue, share }
}
