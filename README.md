# QuiverKit

**Developer tools that never leave your browser.**

Base64, JSON, JWT, certificates, ciphers, color pickers and more — 60+ tools running
entirely on your own machine. No upload, no account, no tracking. Open the network
tab and check.

One tool is the exception: **DNS lookup** has to ask a resolver, because there is no
offline way to resolve a name. It is badged in the sidebar, on the home page and
inside the tool itself, and it names the resolver it talks to. Everything else never
leaves the page.

Most online dev tools ask you to paste a production JWT, a customer payload or an
internal config into someone else's server. QuiverKit exists so you never have to.

## Tools

### Encoding
| Tool | What it does |
| --- | --- |
| Base64 | Encode and decode, URL-safe variant, full Unicode support |
| Base Encoding | Base32, Base58 (Bitcoin) and other RFC 4648 encodings |
| Hex Viewer | Hex dump, binary inspection, byte-level viewer |
| URL | Percent-encode and decode query strings and URIs |
| Punycode | International domain name (IDN) encode and decode |
| Escape | Escape and unescape for JSON, HTML, SQL, shell and regex |
| Gzip | Compress and decompress with gzip, brotli, deflate or zlib |
| JWT | Decode and verify JSON Web Tokens, inspect claims |
| QR Code | Generate and decode QR codes from text or image |

### Formatting
| Tool | What it does |
| --- | --- |
| JSON | Format, minify, sort keys, validate |
| JSON Diff | Compare two JSON documents structurally, key by key |
| JSONPath | Query JSON with JSONPath expressions (like jq) |
| GraphQL | Format and prettify GraphQL queries and SDL schemas |
| SQL | Beautify and format SQL queries |
| XML | Format and indent XML / HTML markup |
| Markdown | Preview and convert Markdown to HTML |

### Text
| Tool | What it does |
| --- | --- |
| Case | Convert between camelCase, snake_case, kebab-case, PascalCase |
| Regex | Build and test regular expressions with match highlights |
| Diff | Word-level and line-level text diff comparison |
| Lines | Sort, deduplicate, and reorder lines alphabetically |
| Stats | Character, word, and line counts; reading-time estimates |
| Invisible | Reveal zero-width characters, BOM, non-breaking spaces |
| HTML | Strip HTML tags and decode entities to plain text |
| Cipher | ROT13, Caesar, Atbash, Morse code, and other classic ciphers |

### Converters
| Tool | What it does |
| --- | --- |
| CSV ↔ JSON | Convert between CSV (spreadsheet) and JSON |
| TOML ↔ JSON | Convert between TOML config files and JSON |
| YAML ↔ JSON | Convert between YAML config files and JSON |
| Timestamp | Unix epoch ↔ ISO 8601 date conversion |
| Timezone | Convert times across time zones; world clock |
| Date Diff | Calculate days between dates, durations, deadlines |
| Number Base | Binary, octal, decimal, hexadecimal radix converter |
| Data Size | Convert between bytes, KB, MB, GB, MiB, GiB |

### Design
| Tool | What it does |
| --- | --- |
| Color | Pick and convert between hex, RGB, HSL, OKLCH; WCAG contrast |
| Palette | Generate shade and tint scales, Tailwind harmony palettes |
| Gradient | CSS gradient builder — linear, radial, conic |
| Shadow | Box-shadow generator with elevation presets |
| Units | Convert between px, rem, em, pt and other CSS units |
| Bézier | Cubic-bezier easing curve playground for animations |
| SVG | Optimise and minify SVG, convert to data URI or JSX |
| Colour Vision | Simulate colour blindness — deuteranopia, protanopia, tritanopia |

### Media
| Tool | What it does |
| --- | --- |
| Image | Convert, compress, and resize images (JPEG, PNG, WebP) |
| Favicon | Generate every icon size a site needs from one image |
| EXIF | View and strip GPS and other metadata from photos |

### Network
| Tool | What it does |
| --- | --- |
| CIDR | Subnet calculator — netmask, broadcast, usable IP range |
| DNS | Look up DNS records (A, MX, TXT, NS and more) — **the one tool that contacts a server** |

### Crypto
| Tool | What it does |
| --- | --- |
| Hash | SHA-1, SHA-256, SHA-384, SHA-512 and HMAC digests |
| Checksum | Verify file integrity against a known hash |
| AES | Encrypt and decrypt with AES-GCM using a password |
| Keypair | Generate RSA, ECDSA, and Ed25519 key pairs in PEM |
| Certificate | Decode X.509 PEM certificates; inspect subject, issuer, SAN |
| TOTP | Generate time-based one-time passwords for 2FA |

### Generators
| Tool | What it does |
| --- | --- |
| UUID | Generate UUID v4, time-ordered UUID v7, and Nano ID |
| Password | Generate strong passwords and passphrases with entropy info |
| Lorem Ipsum | Placeholder text — sentences, paragraphs, or word counts |
| Mock Data | Generate fake test data with seedable randomness |

### Dev
| Tool | What it does |
| --- | --- |
| cURL | Convert cURL commands to Python, Go, JavaScript and more |
| Cron | Parse and explain crontab expressions; preview next runs |
| Semver | Validate and compare semantic version ranges |
| Chmod | Unix permissions calculator — numeric ↔ symbolic |
| JSON → Types | Generate TypeScript interfaces from JSON |
| Reference | HTTP status codes, MIME types, and other lookup tables |

## Languages

English, Español, Türkçe — with the structure in place for many more. Each
language is a single JSON file and is downloaded only when selected.

## Development

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # core logic tests
npm run typecheck
npm run build
```

Requires Node 20 or newer.

## How it is put together

```
packages/core   Pure TypeScript. Every transformation lives here, with no
                reference to React or the DOM, so the same logic can back a
                desktop build or a CLI later.
apps/web        React + Vite. Reads the tool registry and does the rendering.
```

Two rules keep it that way:

**Core never speaks a human language.** Tools return `Result<T>` values, and
failures carry an i18n key such as `error.invalidBase64` rather than an English
sentence. Whoever renders the message translates it.

**The registry is the single source of truth.** `apps/web/src/tools/registry.ts`
lists every tool; the sidebar, the search and the routes are all generated from
it. Adding a tool means adding one entry and one component — each is lazily
loaded, so a visitor only downloads the tool they opened.

## License

MIT — see [LICENSE](./LICENSE).
