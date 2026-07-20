/*
 * The web and desktop builds do this in an inline <script> in the document head,
 * which is the only way to beat the first paint. Manifest V3 forbids inline
 * script outright, so here it is a module imported first thing in main.tsx —
 * still ahead of React, just not ahead of the parser.
 */
const STORAGE_KEY = 'quiverkit.theme'

const stored = localStorage.getItem(STORAGE_KEY)
// Retro was replaced by dim; carry the old preference across.
const migrated = stored === 'retro' ? 'dim' : stored
if (migrated !== null && migrated !== stored) localStorage.setItem(STORAGE_KEY, migrated)

const prefersDark = matchMedia('(prefers-color-scheme: dark)').matches
document.documentElement.dataset.theme = migrated ?? (prefersDark ? 'dark' : 'light')
