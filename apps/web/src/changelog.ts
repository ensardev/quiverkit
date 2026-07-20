/**
 * Desktop-app release history shown on the download page. Newest first. The
 * change lines stay in English rather than going through i18n — release notes
 * would otherwise need nine translations every version, and a short technical
 * list is the one place readers tolerate English. Dates are ISO so the page can
 * format them for the reader's locale.
 */
export interface Release {
  version: string
  date: string
  changes: string[]
}

export const CHANGELOG: Release[] = [
  {
    version: '0.1.0',
    date: '2026-07-21',
    changes: [
      'First release of the QuiverKit desktop app.',
      'Installers for Windows (.msi, .exe) and Linux (.deb, .rpm, AppImage).',
      'The whole tool catalogue, running fully offline in a native window.',
    ],
  },
]
