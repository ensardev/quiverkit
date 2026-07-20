import { Outlet } from 'react-router-dom'
import CommandPalette from '@/components/CommandPalette'
import Footer from '@/components/Footer'
import Sidebar from '@/components/Sidebar'
import TopBar from '@/components/TopBar'

export default function Layout() {
  return (
    // The top bar and footer span the full width, and the sidebar sits between
    // them — so both horizontal lines run edge to edge and the sidebar's border
    // is the only vertical one, with no cell corners stepping against it.
    <div className="flex h-dvh flex-col overflow-hidden">
      <TopBar />

      <div className="flex min-h-0 flex-1">
        <Sidebar />

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
