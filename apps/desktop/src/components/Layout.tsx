import { useCallback } from 'react'
import { Outlet } from 'react-router-dom'
import Titlebar from './Titlebar'
import CommandPalette from '@/components/CommandPalette'

export default function DesktopLayout() {
  const openUrl = useCallback((e: React.MouseEvent<HTMLAnchorElement>, url: string) => {
    e.preventDefault()
    import('@tauri-apps/plugin-opener')
      .then(({ openUrl: opener }) => opener(url))
      .catch(() => {
        // Fallback for browser dev mode
        window.open(url, '_blank')
      })
  }, [])

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <Titlebar />

      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>

      <footer className="border-line bg-surface flex shrink-0 items-center justify-center gap-4 border-t px-4 py-1.5 text-xs">
        <a
          href="https://ensar.dev"
          onClick={(e) => openUrl(e, 'https://ensar.dev')}
          className="text-muted hover:text-ink cursor-pointer transition-colors"
        >
          ensar.dev
        </a>
        <a
          href="https://github.com/ensardev/quiverkit"
          onClick={(e) => openUrl(e, 'https://github.com/ensardev/quiverkit')}
          className="text-muted hover:text-ink cursor-pointer transition-colors"
        >
          GitHub
        </a>
      </footer>

      <CommandPalette />
    </div>
  )
}
