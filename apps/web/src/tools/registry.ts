import { lazy, type ComponentType, type LazyExoticComponent } from 'react'

export type ToolCategory =
  | 'encoding'
  | 'formatting'
  | 'text'
  | 'converters'
  | 'crypto'
  | 'generators'

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
 * visitor who only wanted to decode a JWT would pay for all seventy.
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
    id: 'hash',
    category: 'crypto',
    keywords: ['sha', 'sha256', 'digest', 'checksum', 'hmac', 'md5'],
    Component: lazy(() => import('./hash/HashTool')),
  },
  {
    id: 'uuid',
    category: 'generators',
    keywords: ['guid', 'nanoid', 'id', 'random', 'v4', 'v7'],
    Component: lazy(() => import('./uuid/UuidTool')),
  },
]

export const CATEGORY_ORDER: ToolCategory[] = [
  'encoding',
  'formatting',
  'text',
  'converters',
  'crypto',
  'generators',
]

export function findTool(id: string): Tool | undefined {
  return TOOLS.find((tool) => tool.id === id)
}
