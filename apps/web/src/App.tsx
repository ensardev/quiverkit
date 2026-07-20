import { Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from '@/components/Layout'
import Download from '@/pages/Download'
import Home from '@/pages/Home'
import { TOOLS } from '@/tools/registry'

function ToolFallback() {
  return <div className="text-muted p-8 text-sm">…</div>
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="download" element={<Download />} />
        {TOOLS.map(({ id, Component }) => (
          <Route
            key={id}
            path={id}
            element={
              <Suspense fallback={<ToolFallback />}>
                <Component />
              </Suspense>
            }
          />
        ))}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
