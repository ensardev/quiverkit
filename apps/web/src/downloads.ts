import { CHANGELOG } from '@/changelog'
import { LINKS } from '@/links'

/**
 * The desktop installers, built by the release workflow and attached to the
 * matching GitHub release. The version comes from the top changelog entry so it
 * lives in exactly one place; the release must be tagged `v<version>` and the
 * asset names follow Tauri's defaults (bump these together on a rename).
 */
export const DESKTOP_VERSION = CHANGELOG[0]?.version ?? '0.1.0'

const base = `${LINKS.repo}/releases/download/v${DESKTOP_VERSION}`

export const DOWNLOADS = {
  exe: `${base}/QuiverKit_${DESKTOP_VERSION}_x64-setup.exe`,
  msi: `${base}/QuiverKit_${DESKTOP_VERSION}_x64_en-US.msi`,
  deb: `${base}/QuiverKit_${DESKTOP_VERSION}_amd64.deb`,
  rpm: `${base}/QuiverKit-${DESKTOP_VERSION}-1.x86_64.rpm`,
  appimage: `${base}/QuiverKit_${DESKTOP_VERSION}_amd64.AppImage`,
} as const
