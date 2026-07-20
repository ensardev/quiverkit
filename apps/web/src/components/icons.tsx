/**
 * Brand and link glyphs shared by the web footer and the desktop one. Inline
 * rather than fetched: an icon font or a sprite request would be the only thing
 * on the page reaching for the network.
 */

export function GitHubIcon({ size = 14 }: { size?: number }) {
  return (
    <svg viewBox="0 0 16 16" width={size} height={size} fill="currentColor" aria-hidden>
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.4 7.4 0 0 1 2-.27c.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  )
}

export function GlobeIcon({ size = 14 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a15 15 0 0 1 0 18a15 15 0 0 1 0-18" />
    </svg>
  )
}

export function MonitorIcon({ size = 14 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="2" y="4" width="20" height="13" rx="2" />
      <path d="M8 21h8m-4-4v4" />
    </svg>
  )
}

export function DownloadIcon({ size = 14 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 3v12" />
      <path d="M7 10l5 5 5-5" />
      <path d="M5 21h14" />
    </svg>
  )
}

/** The four-pane Windows mark, drawn as one filled path. */
export function WindowsIcon({ size = 16 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden>
      <path d="M3 5.4 10.6 4.3v7.2H3zM11.6 4.15 21 3v8.5h-9.4zM3 12.5h7.6v7.2L3 18.6zM11.6 12.5H21V21l-9.4-1.3z" />
    </svg>
  )
}

/** A Tux silhouette — the universal "this runs on Linux" cue. */
export function LinuxIcon({ size = 16 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden>
      <path d="M12 2.5c-2 0-3.3 1.6-3.3 3.6 0 .8.2 1.4.2 2-1.7 1-3.5 3.2-3.5 7.2 0 .9-.5 1.6-.9 2.3-.3.5-.1 1.1.5 1.3.5.1 1 0 1.4-.2.2.9.6 1.7 1.2 2.3.3.3.8.1.9-.3.2.4.6.7 1.1.8.7.2 1.5.2 2.2.2s1.5 0 2.2-.2c.5-.1.9-.4 1.1-.8.1.4.6.6.9.3.6-.6 1-1.4 1.2-2.3.4.2.9.3 1.4.2.6-.2.8-.8.5-1.3-.4-.7-.9-1.4-.9-2.3 0-4-1.8-6.2-3.5-7.2 0-.6.2-1.2.2-2 0-2-1.3-3.6-3.3-3.6Zm-1.5 3.1a.85.85 0 1 1 0 1.7.85.85 0 0 1 0-1.7Zm3 0a.85.85 0 1 1 0 1.7.85.85 0 0 1 0-1.7Zm-1.5 2.2c.6 0 1.4.4 1.4.9 0 .3-.9.8-1.4.8s-1.4-.5-1.4-.8c0-.5.8-.9 1.4-.9Z" />
    </svg>
  )
}

/** A jigsaw piece for the browser extension. */
export function PuzzleIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M19.44 7.85c-.05.32.06.65.29.88l1.56 1.57c.47.47.71 1.08.71 1.7s-.24 1.23-.71 1.7l-1.6 1.62a.98.98 0 0 1-.84.27c-.47-.07-.8-.48-.97-.92a2.5 2.5 0 1 0-3.21 3.21c.44.17.85.5.92.97a.98.98 0 0 1-.27.84l-1.62 1.6a2.4 2.4 0 0 1-1.7.71 2.4 2.4 0 0 1-1.7-.71l-1.57-1.56a1.03 1.03 0 0 0-.88-.29c-.49.07-.84.5-1.02.97a2.5 2.5 0 1 1-3.24-3.24c.46-.18.9-.53.97-1.02a1.03 1.03 0 0 0-.29-.88L2.7 13.7A2.4 2.4 0 0 1 2 12c0-.62.24-1.23.71-1.7l1.52-1.53c.24-.24.58-.35.92-.3.51.08.87.53 1.07 1.01a2.5 2.5 0 1 0 3.26-3.26c-.48-.2-.93-.56-1.01-1.07-.05-.34.06-.68.3-.92l1.53-1.52A2.4 2.4 0 0 1 12 2c.62 0 1.23.24 1.7.71l1.57 1.56c.23.23.56.34.88.29.49-.07.84-.5 1.02-.97a2.5 2.5 0 1 1 3.24 3.24c-.47.18-.9.53-.97 1.02Z" />
    </svg>
  )
}
