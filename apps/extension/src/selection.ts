export const PENDING_KEY = 'quiverkit.pendingSelection'

/** False when the panel is opened outside Chrome, e.g. `vite preview`. */
function available(): boolean {
  return typeof chrome !== 'undefined' && chrome.storage?.session !== undefined
}

/**
 * Reads the text the context menu left behind and clears it in the same breath,
 * so reopening the panel later starts empty rather than replaying an old
 * selection at someone.
 */
export async function takePendingSelection(): Promise<string> {
  if (!available()) return ''

  const stored = await chrome.storage.session.get(PENDING_KEY)
  const value: unknown = stored[PENDING_KEY]
  if (typeof value !== 'string' || value === '') return ''

  await chrome.storage.session.remove(PENDING_KEY)
  return value
}

/**
 * The panel is often already open when someone sends it a second selection, and
 * nothing remounts in that case — this is how the new text arrives.
 */
export function onSelection(handle: (text: string) => void): () => void {
  if (!available()) return () => {}

  const listener = (
    changes: Record<string, chrome.storage.StorageChange>,
    area: string,
  ) => {
    if (area !== 'session') return

    const value: unknown = changes[PENDING_KEY]?.newValue
    if (typeof value !== 'string' || value === '') return

    void chrome.storage.session.remove(PENDING_KEY)
    handle(value)
  }

  chrome.storage.onChanged.addListener(listener)
  return () => chrome.storage.onChanged.removeListener(listener)
}
