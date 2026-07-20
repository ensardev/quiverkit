import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { LANGUAGES } from '@/i18n'

interface ButtonProps {
  children: ReactNode
  onClick?: () => void
  variant?: 'primary' | 'ghost'
  title?: string
}

export function Button({ children, onClick, variant = 'ghost', title }: ButtonProps) {
  const styles =
    variant === 'primary'
      ? 'bg-accent text-white hover:bg-accent-hover dark:text-black'
      : 'border border-line text-ink hover:bg-hover'

  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`cursor-pointer rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${styles}`}
    >
      {children}
    </button>
  )
}

interface SegmentedControlProps<T extends string> {
  options: readonly { value: T; label: string }[]
  value: T
  onChange: (value: T) => void
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: SegmentedControlProps<T>) {
  return (
    <div className="border-line bg-sunken inline-flex rounded-lg border p-0.5">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          aria-pressed={option.value === value}
          className={`cursor-pointer rounded-md px-3 py-1 text-sm font-medium transition-colors ${
            option.value === value
              ? 'bg-surface text-ink shadow-sm'
              : 'text-muted hover:text-ink'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

export function CopyButton({ value }: { value: string }) {
  const { t } = useTranslation()
  const [copied, setCopied] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)

  // Without this cleanup the timeout would fire after the tool unmounts and
  // React would warn about setting state on a gone component.
  useEffect(() => () => clearTimeout(timer.current), [])

  async function copy() {
    if (!value) return
    await navigator.clipboard.writeText(value)
    setCopied(true)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setCopied(false), 1600)
  }

  return (
    <button
      type="button"
      onClick={copy}
      disabled={!value}
      className="text-muted hover:text-ink cursor-pointer text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40"
    >
      {copied ? t('common.copied') : t('common.copy')}
    </button>
  )
}

interface PanelProps {
  label: string
  action?: ReactNode
  children: ReactNode
  /** Fills the space it is given instead of hugging its content. */
  grow?: boolean
}

export function Panel({ label, action, children, grow = false }: PanelProps) {
  return (
    // `shrink-0` by default matters: inside a flex column, a stack of panels
    // would otherwise share the available height and squeeze every one flat.
    // `grow` opts a panel out of that for editor-style, full-height tools.
    <section
      className={`border-line bg-surface flex flex-col overflow-hidden rounded-xl border ${
        grow ? 'min-h-0 flex-1' : 'shrink-0'
      }`}
    >
      <header className="border-line flex items-center justify-between border-b px-4 py-2">
        <h2 className="text-muted text-xs font-semibold tracking-wide uppercase">{label}</h2>
        {action}
      </header>
      {children}
    </section>
  )
}

interface CodeAreaProps {
  value: string
  onChange?: (value: string) => void
  placeholder?: string
  readOnly?: boolean
}

export function CodeArea({ value, onChange, placeholder, readOnly }: CodeAreaProps) {
  return (
    <textarea
      value={value}
      onChange={(event) => onChange?.(event.target.value)}
      placeholder={placeholder}
      readOnly={readOnly}
      spellCheck={false}
      className="text-ink placeholder:text-muted/60 min-h-64 flex-1 resize-none px-4 py-3 font-mono text-sm leading-relaxed focus:outline-none"
    />
  )
}

export function ErrorNote({ children }: { children: ReactNode }) {
  return (
    <p className="bg-danger-soft text-danger border-line border-t px-4 py-2 text-sm">{children}</p>
  )
}

/**
 * Marks the few tools that reach the network. It appears in the sidebar, on the
 * home page and inside the tool itself, because a privacy promise is only worth
 * anything if its exceptions are impossible to miss.
 */
export function NetworkBadge({ compact = false }: { compact?: boolean }) {
  const { t } = useTranslation()

  return (
    <span
      title={t('network.tooltip')}
      className={`inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-500/15 font-medium text-amber-700 dark:text-amber-300 ${
        compact ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-xs'
      }`}
    >
      <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="3">
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3a15 15 0 0 1 0 18a15 15 0 0 1 0-18" />
      </svg>
      {compact ? t('network.short') : t('network.badge')}
    </span>
  )
}

interface LocaleSelectProps {
  value: string
  onChange: (locale: string) => void
}

/**
 * The language of the *content*, which is not the language of the interface.
 * Someone reading the UI in Turkish may well be converting English text, and
 * Turkish casing would turn "infinity" into "İnfinity". Defaulting to the UI
 * language is only a guess, so the guess has to be visible and changeable.
 */
export function LocaleSelect({ value, onChange }: LocaleSelectProps) {
  const { t } = useTranslation()

  return (
    <label className="text-muted flex items-center gap-2 text-sm">
      {t('common.textLanguage')}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="border-line bg-sunken text-ink cursor-pointer rounded-lg border px-2 py-1 text-sm focus:outline-none"
      >
        {LANGUAGES.map((language) => (
          <option key={language.code} value={language.code}>
            {language.label}
          </option>
        ))}
      </select>
    </label>
  )
}

interface DataRowProps {
  label: string
  value: string
  hint?: string
}

/** Label on the left, monospace value on the right, copyable. */
export function DataRow({ label, value, hint }: DataRowProps) {
  return (
    <div className="border-line flex items-baseline justify-between gap-4 border-b px-4 py-2.5 last:border-b-0">
      <div className="min-w-0">
        <span className="text-muted text-sm">{label}</span>
        {hint && <span className="text-muted/70 ml-2 text-xs">{hint}</span>}
      </div>
      <div className="flex min-w-0 items-baseline gap-3">
        <span className="truncate font-mono text-sm">{value}</span>
        <CopyButton value={value} />
      </div>
    </div>
  )
}

interface ToolShellProps {
  id: string
  children: ReactNode
  /**
   * Takes the whole viewport instead of the usual reading-width column. For
   * tools that are really editors — write on one side, watch the other — a
   * centred 5xl box wastes most of the screen.
   */
  fill?: boolean
}

/** Every tool page shares this header, sourced from `tools.<id>.*`. */
export function ToolShell({ id, children, fill = false }: ToolShellProps) {
  const { t } = useTranslation()

  return (
    <article
      className={`mx-auto flex w-full flex-col gap-6 p-6 lg:p-10 ${
        fill ? 'h-full max-w-none overflow-hidden' : 'max-w-5xl'
      }`}
    >
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">{t(`tools.${id}.name`)}</h1>
        <p className="text-muted text-sm">{t(`tools.${id}.description`)}</p>
      </header>
      {children}
    </article>
  )
}
