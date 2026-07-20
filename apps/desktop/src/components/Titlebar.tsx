import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import LanguagePicker from '@/components/LanguagePicker'
import ThemeToggle from './ThemeToggle'

/**
 * Dragging is handled by `data-tauri-drag-region`, not a mousedown listener.
 *
 * A listener on the bar fires for every descendant too, so calling
 * startDragging() there hands the press to the OS and the click that would have
 * followed never lands — that is what killed the window buttons and left the
 * language <select> unable to open. The attribute only acts when the press is
 * on the marked element itself, and it gives double-click-to-maximise for free.
 */
function useWindowControls() {
  const [maximized, setMaximized] = useState(false)

  useEffect(() => {
    let cancelled = false
    let unlisten: (() => void) | undefined

    void import('@tauri-apps/api/window')
      .then(async ({ getCurrentWindow }) => {
        const win = getCurrentWindow()
        const sync = async () => {
          if (!cancelled) setMaximized(await win.isMaximized())
        }
        await sync()
        unlisten = await win.onResized(sync)
      })
      .catch(() => {
        // Running in a plain browser (npm run dev:vite) — no window to talk to.
      })

    return () => {
      cancelled = true
      unlisten?.()
    }
  }, [])

  // Imported per click rather than held in a ref: the call always reaches a live
  // window handle, and a slow first import can no longer leave buttons dead.
  const act = useCallback((method: 'minimize' | 'toggleMaximize' | 'close') => {
    void import('@tauri-apps/api/window')
      .then(({ getCurrentWindow }) => getCurrentWindow()[method]())
      .catch(() => {})
  }, [])

  return {
    maximized,
    minimize: useCallback(() => act('minimize'), [act]),
    toggleMaximize: useCallback(() => act('toggleMaximize'), [act]),
    close: useCallback(() => act('close'), [act]),
  }
}

export default function Titlebar() {
  const { t } = useTranslation()
  const { maximized, minimize, toggleMaximize, close } = useWindowControls()

  return (
    <div
      data-tauri-drag-region
      className="border-line bg-surface flex shrink-0 items-center gap-3 border-b px-4 select-none"
      style={{ height: 40 }}
    >
      <Link to="/" className="flex items-baseline gap-1.5">
        <span className="text-sm font-semibold tracking-tight">Quiver</span>
        <span className="text-accent text-sm font-semibold tracking-tight">Kit</span>
      </Link>

      <span data-tauri-drag-region className="text-muted hidden text-xs sm:inline">
        {t('palette.hint')}
      </span>

      {/* The wide empty stretch is the main grab area. */}
      <div data-tauri-drag-region className="flex-1 self-stretch" />

      <div className="flex items-center gap-0.5">
        <LanguagePicker />
        <ThemeToggle />
      </div>

      <div className="-mr-3 ml-1 flex h-full">
        <button
          type="button"
          onClick={minimize}
          className="text-muted hover:text-ink hover:bg-hover flex h-full w-10 cursor-pointer items-center justify-center transition-colors"
          aria-label="Minimise"
        >
          <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14" />
          </svg>
        </button>

        <button
          type="button"
          onClick={toggleMaximize}
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
          onClick={close}
          className="text-muted hover:bg-danger flex h-full w-10 cursor-pointer items-center justify-center transition-colors hover:text-white"
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
