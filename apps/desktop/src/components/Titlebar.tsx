import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import LanguagePicker from '@/components/LanguagePicker'
import ThemeToggle from './ThemeToggle'

interface Win {
  minimize(): Promise<void>
  toggleMaximize(): Promise<void>
  close(): Promise<void>
  isMaximized(): Promise<boolean>
  startDragging(): Promise<void>
  onResized(fn: () => void): Promise<() => void>
}

export default function Titlebar() {
  const { t } = useTranslation()
  const [maximized, setMaximized] = useState(false)
  const [ready, setReady] = useState(false)
  const win = useRef<Win | null>(null)

  useEffect(() => {
    let cancelled = false
    import('@tauri-apps/api/window')
      .then(async ({ getCurrentWindow }) => {
        if (cancelled) return
        const w = getCurrentWindow()
        win.current = {
          minimize: () => w.minimize(),
          toggleMaximize: () => w.toggleMaximize(),
          close: () => w.close(),
          isMaximized: () => w.isMaximized(),
          startDragging: () => w.startDragging(),
          onResized: (fn) => w.onResized(fn),
        }
        setMaximized(await w.isMaximized())
        w.onResized(async () => { if (!cancelled) setMaximized(await w.isMaximized()) })
        setReady(true)
      })
      .catch(() => { /* browser dev mode */ })
    return () => { cancelled = true }
  }, [])

  const minimize = useCallback(() => { win.current?.minimize() }, [])
  const toggleMaximize = useCallback(() => { win.current?.toggleMaximize() }, [])
  const closeWindow = useCallback(() => { win.current?.close() }, [])
  const onDrag = useCallback((e: React.MouseEvent) => {
    // Only left button, only when Tauri is ready
    if (e.button !== 0 || !ready) return
    e.preventDefault()
    win.current?.startDragging()
  }, [ready])

  return (
    <div
      onMouseDown={onDrag}
      className="border-line bg-surface flex shrink-0 select-none items-center gap-3 border-b px-4"
      style={{ height: 40 }}
    >
      <Link to="/" className="flex items-baseline gap-1.5">
        <span className="text-sm font-semibold tracking-tight">Quiver</span>
        <span className="text-accent text-sm font-semibold tracking-tight">Kit</span>
      </Link>

      <span className="text-muted hidden text-xs sm:inline">
        {t('palette.hint')}
      </span>

      <div className="flex-1" />

      <div className="flex items-center gap-0.5">
        <LanguagePicker />
        <ThemeToggle />
      </div>

      <div className="-mr-3 ml-1 flex h-full">
        <button
          type="button"
          onClick={minimize}
          disabled={!ready}
          className="text-muted hover:text-ink hover:bg-hover flex h-full w-10 cursor-pointer items-center justify-center transition-colors disabled:opacity-30"
          aria-label="Minimise"
        >
          <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14" />
          </svg>
        </button>

        <button
          type="button"
          onClick={toggleMaximize}
          disabled={!ready}
          className="text-muted hover:text-ink hover:bg-hover flex h-full w-10 cursor-pointer items-center justify-center transition-colors disabled:opacity-30"
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
          onClick={closeWindow}
          disabled={!ready}
          className="text-muted hover:bg-danger hover:text-white flex h-full w-10 cursor-pointer items-center justify-center transition-colors disabled:opacity-30"
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
