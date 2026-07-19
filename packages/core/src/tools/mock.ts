import { err, ok, type Result } from '../result.js'

export const MOCK_FIELDS = [
  'uuid', 'id', 'firstName', 'lastName', 'fullName', 'email', 'username',
  'phone', 'city', 'country', 'company', 'jobTitle', 'sentence', 'url',
  'date', 'datetime', 'boolean', 'integer', 'price', 'colour',
] as const

export type MockField = (typeof MOCK_FIELDS)[number]

/** Names drawn from several regions rather than one, so mock data does not
 *  quietly assume every user is American. */
const FIRST_NAMES = [
  'Ada', 'Kenji', 'Zeynep', 'Mateo', 'Amara', 'Lars', 'Priya', 'Diego',
  'Elif', 'Yuki', 'Nia', 'Tomás', 'Ingrid', 'Omar', 'Sofia', 'Hasan',
]

const LAST_NAMES = [
  'Lovelace', 'Tanaka', 'Yılmaz', 'García', 'Okafor', 'Andersen', 'Sharma',
  'Rossi', 'Demir', 'Nakamura', 'Mensah', 'Silva', 'Berg', 'Haddad',
]

const CITIES = [
  'Istanbul', 'Kyoto', 'Lisbon', 'Nairobi', 'Bogotá', 'Helsinki',
  'Jaipur', 'Valparaíso', 'Reykjavík', 'Da Nang',
]

const COUNTRIES = [
  'Türkiye', 'Japan', 'Portugal', 'Kenya', 'Colombia', 'Finland',
  'India', 'Chile', 'Iceland', 'Vietnam',
]

const COMPANIES = ['Northwind', 'Contoso', 'Umbrella', 'Initech', 'Globex', 'Acme', 'Hooli']
const TITLES = ['Engineer', 'Designer', 'Analyst', 'Manager', 'Researcher', 'Consultant']
const WORDS = 'system default screen panel value colour layout signal buffer render module'.split(' ')

function slug(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/ı/g, 'i')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
}

interface Random {
  int: (max: number) => number
  pick: <T>(list: readonly T[]) => T
}

/**
 * A seeded generator, so the same seed rebuilds the same data. Regenerating a
 * fixture that shifts every time is worse than useless for tests.
 */
function makeRandom(seed: number): Random {
  let state = seed || 1

  const next = () => {
    // xorshift32: small, fast and good enough for placeholder data.
    state ^= state << 13
    state ^= state >>> 17
    state ^= state << 5
    return (state >>> 0) / 0x100000000
  }

  const int = (max: number) => Math.floor(next() * max)
  return { int, pick: (list) => list[int(list.length)] as never }
}

/**
 * A UUID drawn from the seeded generator rather than `crypto.randomUUID`, which
 * would ignore the seed and make every run different.
 */
function seededUuid(random: Random): string {
  const hex = (length: number) =>
    Array.from({ length }, () => random.int(16).toString(16)).join('')

  return `${hex(8)}-${hex(4)}-4${hex(3)}-${'89ab'[random.int(4)] as string}${hex(3)}-${hex(12)}`
}

interface Person {
  first: string
  last: string
}

function value(field: MockField, random: Random, index: number, person: Person): unknown {
  const { first, last } = person

  switch (field) {
    case 'uuid':
      return seededUuid(random)
    case 'id':
      return index + 1
    case 'firstName':
      return first
    case 'lastName':
      return last
    case 'fullName':
      return `${first} ${last}`
    case 'email':
      return `${slug(first)}.${slug(last)}@example.com`
    case 'username':
      return `${slug(first)}${random.int(90) + 10}`
    case 'phone':
      return `+90 5${random.int(90) + 10} ${String(random.int(1000)).padStart(3, '0')} ${String(random.int(10000)).padStart(4, '0')}`
    case 'city':
      return random.pick(CITIES)
    case 'country':
      return random.pick(COUNTRIES)
    case 'company':
      return random.pick(COMPANIES)
    case 'jobTitle':
      return `${random.pick(['Senior', 'Lead', 'Staff', 'Junior'])} ${random.pick(TITLES)}`
    case 'sentence':
      return `${Array.from({ length: 6 }, () => random.pick(WORDS)).join(' ')}.`
    case 'url':
      return `https://${random.pick(COMPANIES).toLowerCase()}.example.com/${random.pick(WORDS)}`
    case 'date':
      return new Date(Date.UTC(2020 + random.int(6), random.int(12), random.int(28) + 1))
        .toISOString()
        .slice(0, 10)
    case 'datetime':
      return new Date(Date.UTC(2020 + random.int(6), random.int(12), random.int(28) + 1, random.int(24), random.int(60))).toISOString()
    case 'boolean':
      return random.int(2) === 1
    case 'integer':
      return random.int(1000)
    case 'price':
      return Number((random.int(100000) / 100).toFixed(2))
    case 'colour':
      return `#${random.int(0xffffff).toString(16).padStart(6, '0')}`
  }
}

export interface MockOptions {
  fields: { name: string; type: MockField }[]
  count: number
  seed: number
}

export function generateMockData(options: MockOptions, indent = 2): Result<string> {
  if (options.fields.length === 0) return err('error.emptyInput')

  const count = Math.max(1, Math.min(options.count, 500))
  const random = makeRandom(options.seed)

  const rows = Array.from({ length: count }, (_, index) => {
    // The name is drawn once per row, so `fullName` and `email` describe the
    // same imaginary person instead of two different ones.
    const person: Person = { first: random.pick(FIRST_NAMES), last: random.pick(LAST_NAMES) }

    return Object.fromEntries(
      options.fields.map((field) => [field.name, value(field.type, random, index, person)]),
    )
  })

  return ok(JSON.stringify(rows, null, indent))
}
