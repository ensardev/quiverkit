import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import CommandPalette from '@/components/CommandPalette'
import Footer from '@/components/Footer'
import Sidebar from '@/components/Sidebar'
import TopBar from '@/components/TopBar'

export default function Layout() {
  // On mobile the sidebar is an off-canvas drawer; this owns whether it's open,
  // since the toggle (TopBar) and the drawer (Sidebar) are siblings.
  const [menuOpen, setMenuOpen] = useState(false)
  const { pathname } = useLocation()

  // Picking a tool navigates — close the drawer so the content is visible.
  useEffect(() => setMenuOpen(false), [pathname])

  return (
    // The top bar and footer span the full width, and the sidebar sits between
    // them — so both horizontal lines run edge to edge and the sidebar's border
    // is the only vertical one, with no cell corners stepping against it.
    <div className="flex h-dvh flex-col overflow-hidden">
      <TopBar onMenuToggle={() => setMenuOpen((open) => !open)} />

      {/* relative so the mobile drawer and its backdrop position against this
          row (below the top bar) rather than the whole viewport. */}
      <div className="relative flex min-h-0 flex-1">
        <Sidebar mobileOpen={menuOpen} onClose={() => setMenuOpen(false)} />

        {/* min-w-0 so a wide tool (tables, long code lines) scrolls inside main
            instead of stretching this column. */}
        <main className="min-w-0 flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      <Footer />
      <CommandPalette />
    </div>
  )
}
