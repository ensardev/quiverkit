import { renderMarkdown } from '@quiverkit/core'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CodeArea, CopyButton, ErrorNote, Panel, ToolShell } from '@/components/ui'

function buildPreviewHtml(body: string): string {
  const isDark = document.documentElement.classList.contains('dark')
  const bg = isDark ? '#1a1a2e' : '#ffffff'
  const color = isDark ? '#e0e0e0' : '#333333'
  const codeBg = isDark ? '#2a2a3e' : '#f4f4f4'
  const borderColor = isDark ? '#444' : '#ddd'
  const mutedColor = isDark ? '#999' : '#666'

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light dark">
  <style>
    body {
      font-family: system-ui, -apple-system, sans-serif;
      line-height: 1.6;
      max-width: 48rem;
      margin: 0 auto;
      padding: 1rem;
      background: ${bg};
      color: ${color};
    }
    pre { background: ${codeBg}; padding: 1rem; border-radius: 0.5rem; overflow-x: auto; }
    code { font-family: ui-monospace, monospace; font-size: 0.875em; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid ${borderColor}; padding: 0.5rem; text-align: left; }
    th { background: ${codeBg}; }
    img { max-width: 100%; }
    blockquote { border-left: 3px solid ${borderColor}; margin-left: 0; padding-left: 1rem; color: ${mutedColor}; }
  </style>
</head>
<body>${body}</body>
</html>`
}

export default function MarkdownTool() {
  const { t } = useTranslation()
  const [input, setInput] = useState('')

  const result = useMemo(() => {
    if (input.trim() === '') return null
    return renderMarkdown(input)
  }, [input])

  const html = result?.ok ? result.value : ''

  return (
    <ToolShell id="markdown">
      <div className="grid flex-1 gap-4 lg:grid-cols-2">
        <Panel
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
          <CodeArea
            value={input}
            onChange={setInput}
            placeholder="# Hello, world!"
          />
        </Panel>

        <Panel
          label={t('tools.markdown.preview')}
          action={<CopyButton value={html} />}
        >
          {result?.ok ? (
            <iframe
              srcDoc={buildPreviewHtml(html)}
              className="min-h-64 w-full border-0"
              sandbox="allow-same-origin"
              title={t('tools.markdown.preview')}
            />
          ) : result && !result.ok ? (
            <ErrorNote>{t(result.error)}</ErrorNote>
          ) : (
            <div className="text-muted flex min-h-64 items-center justify-center text-sm">
              {t('common.output')}
            </div>
          )}
        </Panel>
      </div>
    </ToolShell>
  )
}
