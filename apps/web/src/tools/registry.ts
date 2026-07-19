import { lazy, type ComponentType, type LazyExoticComponent } from 'react'

export type ToolCategory =
  | 'encoding'
  | 'formatting'
  | 'text'
  | 'converters'
  | 'design'
  | 'media'
  | 'network'
  | 'crypto'
  | 'generators'
  | 'dev'

export interface Tool {
  /** Doubles as the URL slug and the i18n namespace: `tools.<id>.name`. */
  id: string
  category: ToolCategory
  /**
   * Extra English search terms. Localised names are matched separately, so this
   * list only needs the aliases people actually type — "b64", "guid", "pretty".
   */
  keywords: string[]
  Component: LazyExoticComponent<ComponentType>
}

/**
 * The single source of truth. Sidebar, search and routing all read this list, so
 * adding a tool means adding one entry here plus its component — nothing else.
 *
 * `lazy` matters: without it every tool would ship in the initial bundle and a
 * visitor who only wanted to decode a JWT would pay for all of them.
 */
export const TOOLS: Tool[] = [
  {
    id: 'base64',
    category: 'encoding',
    keywords: ['b64', 'encode', 'decode', 'atob', 'btoa'],
    Component: lazy(() => import('./base64/Base64Tool')),
  },
  {
    id: 'jwt',
    category: 'encoding',
    keywords: ['token', 'bearer', 'auth', 'claims', 'decode'],
    Component: lazy(() => import('./jwt/JwtTool')),
  },
  {
    id: 'url',
    category: 'encoding',
    keywords: ['uri', 'percent', 'escape', 'query', 'querystring'],
    Component: lazy(() => import('./url/UrlTool')),
  },
  {
    id: 'escape',
    category: 'encoding',
    keywords: ['quote', 'unescape', 'entities', 'sql', 'shell', 'backslash'],
    Component: lazy(() => import('./escape/EscapeTool')),
  },
  {
    id: 'json',
    category: 'formatting',
    keywords: ['pretty', 'beautify', 'minify', 'format', 'validate'],
    Component: lazy(() => import('./json/JsonTool')),
  },
  {
    id: 'case',
    category: 'text',
    keywords: ['camel', 'snake', 'kebab', 'pascal', 'slug', 'slugify', 'capitalize'],
    Component: lazy(() => import('./case/CaseTool')),
  },
  {
    id: 'regex',
    category: 'text',
    keywords: ['regexp', 'pattern', 'match', 'test', 'expression'],
    Component: lazy(() => import('./regex/RegexTool')),
  },
  {
    id: 'diff',
    category: 'text',
    keywords: ['compare', 'difference', 'changes', 'patch'],
    Component: lazy(() => import('./diff/DiffTool')),
  },
  {
    id: 'invisible',
    category: 'text',
    keywords: ['zero width', 'hidden', 'whitespace', 'unicode', 'bom', 'nbsp'],
    Component: lazy(() => import('./invisible/InvisibleTool')),
  },
  {
    id: 'lines',
    category: 'text',
    keywords: ['sort', 'unique', 'dedupe', 'duplicate', 'alphabetical', 'order'],
    Component: lazy(() => import('./lines/LinesTool')),
  },
  {
    id: 'stats',
    category: 'text',
    keywords: ['count', 'characters', 'words', 'length', 'reading'],
    Component: lazy(() => import('./stats/StatsTool')),
  },
  {
    id: 'timestamp',
    category: 'converters',
    keywords: ['unix', 'epoch', 'date', 'time', 'iso'],
    Component: lazy(() => import('./timestamp/TimestampTool')),
  },
  {
    id: 'numberBase',
    category: 'converters',
    keywords: ['binary', 'hex', 'octal', 'decimal', 'radix', 'base'],
    Component: lazy(() => import('./numberBase/NumberBaseTool')),
  },
  {
    id: 'dataSize',
    category: 'converters',
    keywords: ['bytes', 'kb', 'mb', 'gb', 'mib', 'gib', 'storage'],
    Component: lazy(() => import('./dataSize/DataSizeTool')),
  },
  {
    id: 'color',
    category: 'design',
    keywords: ['hex', 'rgb', 'hsl', 'oklch', 'contrast', 'wcag', 'accessibility', 'a11y'],
    Component: lazy(() => import('./color/ColorTool')),
  },
  {
    id: 'units',
    category: 'design',
    keywords: ['px', 'rem', 'em', 'pt', 'font', 'size'],
    Component: lazy(() => import('./units/UnitsTool')),
  },
  {
    id: 'gradient',
    category: 'design',
    keywords: ['linear', 'radial', 'conic', 'background', 'css'],
    Component: lazy(() => import('./gradient/GradientTool')),
  },
  {
    id: 'shadow',
    category: 'design',
    keywords: ['box-shadow', 'elevation', 'depth', 'css'],
    Component: lazy(() => import('./shadow/ShadowTool')),
  },
  {
    id: 'bezier',
    category: 'design',
    keywords: ['cubic', 'easing', 'animation', 'transition', 'curve'],
    Component: lazy(() => import('./bezier/BezierTool')),
  },
  {
    id: 'image',
    category: 'media',
    keywords: ['convert', 'compress', 'resize', 'webp', 'jpeg', 'png'],
    Component: lazy(() => import('./image/ImageTool')),
  },
  {
    id: 'exif',
    category: 'media',
    keywords: ['metadata', 'gps', 'location', 'privacy', 'photo', 'strip'],
    Component: lazy(() => import('./exif/ExifTool')),
  },
  {
    id: 'cidr',
    category: 'network',
    keywords: ['subnet', 'netmask', 'ip', 'ipv4', 'network', 'broadcast'],
    Component: lazy(() => import('./cidr/CidrTool')),
  },
  {
    id: 'hash',
    category: 'crypto',
    keywords: ['sha', 'sha256', 'digest', 'checksum', 'hmac', 'md5'],
    Component: lazy(() => import('./hash/HashTool')),
  },
  {
    id: 'checksum',
    category: 'crypto',
    keywords: ['file', 'verify', 'download', 'integrity', 'sha256'],
    Component: lazy(() => import('./checksum/ChecksumTool')),
  },
  {
    id: 'aes',
    category: 'crypto',
    keywords: ['encrypt', 'decrypt', 'gcm', 'cipher', 'password'],
    Component: lazy(() => import('./aes/AesTool')),
  },
  {
    id: 'keypair',
    category: 'crypto',
    keywords: ['rsa', 'ecdsa', 'ed25519', 'pem', 'public', 'private'],
    Component: lazy(() => import('./keypair/KeypairTool')),
  },
  {
    id: 'uuid',
    category: 'generators',
    keywords: ['guid', 'nanoid', 'id', 'random', 'v4', 'v7'],
    Component: lazy(() => import('./uuid/UuidTool')),
  },
  {
    id: 'password',
    category: 'generators',
    keywords: ['passphrase', 'secret', 'random', 'entropy', 'strong'],
    Component: lazy(() => import('./password/PasswordTool')),
  },
  {
    id: 'chmod',
    category: 'dev',
    keywords: ['permissions', 'unix', 'linux', '755', '644', 'rwx'],
    Component: lazy(() => import('./chmod/ChmodTool')),
  },
  {
    id: 'semver',
    category: 'dev',
    keywords: ['version', 'semantic', 'range', 'caret', 'tilde', 'npm'],
    Component: lazy(() => import('./semver/SemverTool')),
  },
  {
    id: 'curl',
    category: 'dev',
    keywords: ['http', 'request', 'fetch', 'axios', 'python', 'go', 'convert'],
    Component: lazy(() => import('./curl/CurlTool')),
  },
]

export const CATEGORY_ORDER: ToolCategory[] = [
  'encoding',
  'formatting',
  'text',
  'converters',
  'design',
  'media',
  'network',
  'crypto',
  'generators',
  'dev',
]

export function findTool(id: string): Tool | undefined {
  return TOOLS.find((tool) => tool.id === id)
}
