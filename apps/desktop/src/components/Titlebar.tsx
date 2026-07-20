import { useState, useEffect } from 'react'
import { getCurrentWindow } from '@tauri-apps/api/window'

const win = getCurrentWindow()

export default function Titlebar() {
  const [maximized, setMaximized] = useState(false)

  useEffect(() => {
    let unlisten: (() => void) | undefined

    import('@tauri-apps/api/window')
      .then(async () => {
        setMaximized(await win.isMaximized())
        const listener = await win.onResized(async () => {
          setMaximized(await win.isMaximized())
        })
        unlisten = listener
      })
      .catch(() => {
        // Not inside Tauri (e.g. dev in browser) — titlebar still renders
      })

    return () => {
      unlisten?.()
    }
  }, [])

  return (
    <div
      data-tauri-drag-region
      className="border-line bg-surface flex shrink-0 select-none items-center border-b pl-4"
      style={{ height: 36 }}
    >
      <span className="text-muted text-xs font-medium tracking-wide">
        QuiverKit
      </span>

      <div className="ml-auto flex h-full">
        <button
          type="button"
          onClick={() => win.minimize()}
          className="text-muted hover:text-ink hover:bg-hover flex h-full w-10 cursor-pointer items-center justify-center transition-colors"
          aria-label="Minimise"
        >
          <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14" />
          </svg>
        </button>

        <button
          type="button"
          onClick={() => win.toggleMaximize()}
          className="text-muted hover:text-ink hover:bg-hover flex h-full w-10 cursor-pointer items-center justify-center transition-colors"
          aria-label={maximized ? 'Restore' : 'Maximise'}
        >
          {maximized ? (
            <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" strokeWidth="2" fill="none">
              <path d="M8 3v2H4v12h12v-4h2V3H8z" />
              <path d="M18 9h2v12H8v-2" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" strokeWidth="2">
              <path d="M4 4h16v16H4z" />
            </svg>
          )}
        </button>

        <button
          type="button"
          onClick={() => win.close()}
          className="text-muted hover:bg-danger hover:text-white flex h-full w-10 cursor-pointer items-center justify-center transition-colors"
          aria-label="Close"
        >
          <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}
