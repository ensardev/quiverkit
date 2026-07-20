import { Outlet } from 'react-router-dom'
import CommandPalette from '@/components/CommandPalette'
import Sidebar from '@/components/Sidebar'

export default function Layout() {
  return (
    <div className="flex h-dvh overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
      <CommandPalette />
    </div>
  )
}
