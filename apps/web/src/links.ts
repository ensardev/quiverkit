/**
 * Every outbound URL the apps link to, in one place. The desktop build imports
 * these too, so a moved repo or a new domain is a single edit rather than a
 * hunt through two footers.
 */
export const LINKS = {
  author: 'https://ensar.dev',
  website: 'https://quiverkit.dev',
  repo: 'https://github.com/ensardev/quiverkit',
  releases: 'https://github.com/ensardev/quiverkit/releases',
  extension:
    'https://chromewebstore.google.com/detail/quiverkit/hfobibbmkjgelnpdbbhgcmbollpglkcg',
  licence: 'https://github.com/ensardev/quiverkit/blob/main/LICENSE',
} as const
