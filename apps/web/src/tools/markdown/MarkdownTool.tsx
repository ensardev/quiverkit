import { renderMarkdown } from '@quiverkit/core/markdown'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CodeArea, CopyButton, ErrorNote, Panel, ToolShell } from '@/components/ui'

/**
 * The theme lives in a `data-theme` attribute, not a class, and the preview is
 * a separate document that cannot inherit our CSS variables — so it has to be
 * told which palette to use, and told again when the user switches.
 */
function useThemeIsDark(): boolean {
  const [dark, setDark] = useState(() => document.documentElement.dataset.theme === 'dark')

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setDark(document.documentElement.dataset.theme === 'dark')
    })

    observer.observe(document.documentElement, { attributeFilter: ['data-theme'] })
    return () => observer.disconnect()
  }, [])

  return dark
}

function buildPreviewHtml(body: string, dark: boolean): string {
  const palette = dark
    ? { bg: '#0c0a09', text: '#fafaf9', code: '#1c1917', border: '#292524', muted: '#a8a29e' }
    : { bg: '#ffffff', text: '#1c1917', code: '#f5f5f4', border: '#e7e5e4', muted: '#78716c' }

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    :root { color-scheme: ${dark ? 'dark' : 'light'}; }
    body {
      font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
      line-height: 1.65;
      max-width: 46rem;
      margin: 0 auto;
      padding: 1.5rem;
      background: ${palette.bg};
      color: ${palette.text};
    }
    h1, h2, h3 { line-height: 1.25; margin-top: 1.6em; }
    h1:first-child, h2:first-child { margin-top: 0; }
    pre { background: ${palette.code}; padding: 1rem; border-radius: 0.5rem; overflow-x: auto; }
    code { font-family: ui-monospace, 'Cascadia Code', monospace; font-size: 0.875em; }
    :not(pre) > code { background: ${palette.code}; padding: 0.15em 0.4em; border-radius: 0.3em; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid ${palette.border}; padding: 0.5rem; text-align: left; }
    th { background: ${palette.code}; }
    img { max-width: 100%; }
    hr { border: none; border-top: 1px solid ${palette.border}; }
    a { color: ${dark ? '#fbbf24' : '#b45309'}; }
    blockquote {
      border-left: 3px solid ${palette.border};
      margin-left: 0;
      padding-left: 1rem;
      color: ${palette.muted};
    }
  </style>
</head>
<body>${body}</body>
</html>`
}

const MIN_PERCENT = 20
const MAX_PERCENT = 80

export default function MarkdownTool() {
  const { t } = useTranslation()
  const dark = useThemeIsDark()
  const [input, setInput] = useState('')
  const [split, setSplit] = useState(50)
  const container = useRef<HTMLDivElement>(null)

  const result = useMemo(() => (input.trim() === '' ? null : renderMarkdown(input)), [input])
  const html = result?.ok ? result.value : ''

  function startDrag(event: React.PointerEvent<HTMLDivElement>) {
    event.currentTarget.setPointerCapture(event.pointerId)

    const move = (moveEvent: PointerEvent) => {
      const box = container.current?.getBoundingClientRect()
      if (!box) return

      const percent = ((moveEvent.clientX - box.left) / box.width) * 100
      setSplit(Math.min(MAX_PERCENT, Math.max(MIN_PERCENT, percent)))
    }

    const stop = () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', stop)
    }

    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', stop)
  }

  return (
    <ToolShell id="markdown" fill>
      <div ref={container} className="flex min-h-0 flex-1 flex-col gap-0 lg:flex-row">
        <div className="flex min-h-0 min-w-0 flex-1 lg:flex-none" style={{ flexBasis: `${split}%` }}>
          <Panel
            grow
            label={t('common.input')}
            action={
              input !== '' && (
                <button
                  type="button"
                  onClick={() => setInput('')}
                  className="text-muted hover:text-ink cursor-pointer text-xs font-medium transition-colors"
                >
                  {t('common.clear')}
                </button>
              )
            }
          >
            <CodeArea value={input} onChange={setInput} placeholder="# Hello, world!" />
          </Panel>
        </div>

        <div
          role="separator"
          aria-orientation="vertical"
          onPointerDown={startDrag}
          onDoubleClick={() => setSplit(50)}
          className="group hidden w-3 shrink-0 cursor-col-resize touch-none items-center justify-center lg:flex"
          title={t('tools.markdown.resize')}
        >
          <span className="bg-line group-hover:bg-accent h-16 w-1 rounded-full transition-colors" />
        </div>

        <div className="mt-4 flex min-h-0 min-w-0 flex-1 lg:mt-0">
          <Panel grow label={t('tools.markdown.preview')} action={<CopyButton value={html} />}>
            {result?.ok ? (
              <iframe
                srcDoc={buildPreviewHtml(html, dark)}
                className="min-h-0 w-full flex-1 border-0"
                // No `allow-scripts`, so nothing in the rendered markdown runs.
                // `allow-same-origin` is left off as well: the preview needs
                // nothing from this origin, and granting it alongside scripts —
                // if anyone ever adds them — would let the frame escape the
                // sandbox entirely.
                sandbox=""
                title={t('tools.markdown.preview')}
              />
            ) : result && !result.ok ? (
              <ErrorNote>{t(result.error)}</ErrorNote>
            ) : (
              <div className="text-muted flex flex-1 items-center justify-center text-sm">
                {t('tools.markdown.empty')}
              </div>
            )}
          </Panel>
        </div>
      </div>
    </ToolShell>
  )
}
