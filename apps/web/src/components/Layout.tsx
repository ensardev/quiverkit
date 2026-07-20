import { Outlet } from 'react-router-dom'
import CommandPalette from '@/components/CommandPalette'
import Footer from '@/components/Footer'
import Sidebar from '@/components/Sidebar'

export default function Layout() {
  return (
    <div className="flex h-dvh overflow-hidden">
      <Sidebar />

      {/* min-w-0 so a wide tool (tables, long code lines) scrolls inside main
          instead of stretching this column and pushing the footer off-screen. */}
      <div className="flex min-w-0 flex-1 flex-col">
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
        <Footer />
      </div>

      <CommandPalette />
    </div>
  )
}
