<div align="center">

<img src="assets/banner.png" alt="QuiverKit — developer tools that never leave your machine" width="640">

---
<br>

[![Latest release](https://img.shields.io/github/v/release/ensardev/quiverkit?color=fbbf24&labelColor=1c1917&label=release)](https://github.com/ensardev/quiverkit/releases)
[![Downloads](https://img.shields.io/github/downloads/ensardev/quiverkit/total?color=fbbf24&labelColor=1c1917&label=downloads)](https://github.com/ensardev/quiverkit/releases)
[![License](https://img.shields.io/github/license/ensardev/quiverkit?color=fbbf24&labelColor=1c1917)](./LICENSE)
[![Chrome Web Store](https://img.shields.io/chrome-web-store/v/hfobibbmkjgelnpdbbhgcmbollpglkcg?color=fbbf24&labelColor=1c1917&label=extension)](https://chromewebstore.google.com/detail/quiverkit/hfobibbmkjgelnpdbbhgcmbollpglkcg)
![Platforms](https://img.shields.io/badge/platform-Windows_%7C_Linux_%7C_Web-fbbf24?labelColor=1c1917)
![Languages](https://img.shields.io/badge/i18n-9_languages-fbbf24?labelColor=1c1917)

**[quiverkit.dev](https://quiverkit.dev)** · **[Download](https://quiverkit.dev/download)** · **[Extension](https://chromewebstore.google.com/detail/quiverkit/hfobibbmkjgelnpdbbhgcmbollpglkcg)** · **[Report an issue](https://github.com/ensardev/quiverkit/issues)**

</div>

---

**62 developer tools — Base64, JSON, JWT, hashes, ciphers, colour tools and more — that run entirely on your own machine.** No upload, no account, no tracking. Open the network tab and check: nothing you paste ever leaves the page.

Most online dev tools ask you to paste a production JWT, a customer payload or an internal config into *someone else's server*. QuiverKit exists so you never have to.

> The one exception is **DNS lookup** — resolving a name needs a resolver, so it contacts one. It is badged everywhere it appears and it names the server it talks to. Everything else is offline, always.

## 📦 Get QuiverKit

### 🌐 Web

Nothing to install — just open **[quiverkit.dev](https://quiverkit.dev)**. Works offline after the first visit (it's a PWA).

### 🖥️ Desktop app — Windows & Linux

A native window, no browser tab to lose track of.

**Windows** — via a package manager:

```powershell
winget install QuiverKit
```

```powershell
scoop bucket add quiverkit https://github.com/ensardev/scoop-quiverkit
scoop install quiverkit
```

Or grab an installer straight from the **[download page](https://quiverkit.dev/download)** or the **[releases](https://github.com/ensardev/quiverkit/releases)**:

| Platform | Formats |
| --- | --- |
| Windows | `.exe` · `.msi` |
| Linux | `.deb` · `.rpm` · `.AppImage` |

> Builds aren't code-signed yet, so Windows may show a SmartScreen prompt — choose **More info → Run anyway**. On Linux, mark the AppImage executable (`chmod +x`) before the first run.

### 🧩 Browser extension

A side panel for Chrome and Edge — select text on any page, right-click, and open it in the right tool. **[Add it from the Chrome Web Store](https://chromewebstore.google.com/detail/quiverkit/hfobibbmkjgelnpdbbhgcmbollpglkcg).**

## 🧰 Tools

62 tools across 11 categories, each lazily loaded so you only download the one you open. Click a category to expand it.

<details>
<summary><b>🔤 Encoding</b> — Base64, Hex, JWT, QR & more</summary><br>

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

</details>

<details>
<summary><b>📐 Formatting</b> — JSON, SQL, XML, Markdown & more</summary><br>

| Tool | What it does |
| --- | --- |
| JSON | Format, minify, sort keys, validate |
| JSON Diff | Compare two JSON documents structurally, key by key |
| JSONPath | Query JSON with JSONPath expressions (like jq) |
| GraphQL | Format and prettify GraphQL queries and SDL schemas |
| SQL | Beautify and format SQL queries |
| XML | Format and indent XML / HTML markup |
| Markdown | Preview and convert Markdown to HTML |

</details>

<details>
<summary><b>📝 Text</b> — Case, Regex, Diff & more</summary><br>

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

</details>

<details>
<summary><b>🔄 Converters</b> — CSV, TOML, YAML, timestamps & more</summary><br>

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

</details>

<details>
<summary><b>🎨 Design</b> — Colour, Palette, Gradient & more</summary><br>

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

</details>

<details>
<summary><b>🖼️ Media</b> — Image, Favicon, EXIF</summary><br>

| Tool | What it does |
| --- | --- |
| Image | Convert, compress, and resize images (JPEG, PNG, WebP) |
| Favicon | Generate every icon size a site needs from one image |
| EXIF | View and strip GPS and other metadata from photos |

</details>

<details>
<summary><b>🌐 Network</b> — CIDR, DNS</summary><br>

| Tool | What it does |
| --- | --- |
| CIDR | Subnet calculator — netmask, broadcast, usable IP range |
| DNS | Look up DNS records (A, MX, TXT, NS…) — **the one tool that contacts a server** |

</details>

<details>
<summary><b>🔐 Crypto</b> — Hash, AES, Keypair, Certificate & more</summary><br>

| Tool | What it does |
| --- | --- |
| Hash | SHA-1, SHA-256, SHA-384, SHA-512 and HMAC digests |
| Checksum | Verify file integrity against a known hash |
| AES | Encrypt and decrypt with AES-GCM using a password |
| Keypair | Generate RSA, ECDSA, and Ed25519 key pairs in PEM |
| Certificate | Decode X.509 PEM certificates; inspect subject, issuer, SAN |
| TOTP | Generate time-based one-time passwords for 2FA |

</details>

<details>
<summary><b>⚙️ Generators</b> — UUID, Password, Mock data & more</summary><br>

| Tool | What it does |
| --- | --- |
| UUID | Generate UUID v4, time-ordered UUID v7, and Nano ID |
| Password | Generate strong passwords and passphrases with entropy info |
| Lorem Ipsum | Placeholder text — sentences, paragraphs, or word counts |
| Mock Data | Generate fake test data with seedable randomness |

</details>

<details>
<summary><b>🧑‍💻 Dev</b> — cURL, Cron, Semver & more</summary><br>

| Tool | What it does |
| --- | --- |
| cURL | Convert cURL commands to Python, Go, JavaScript and more |
| Cron | Parse and explain crontab expressions; preview next runs |
| Semver | Validate and compare semantic version ranges |
| Chmod | Unix permissions calculator — numeric ↔ symbolic |
| JSON → Types | Generate TypeScript interfaces from JSON |
| Reference | HTTP status codes, MIME types, and other lookup tables |

</details>

<details>
<summary><b>🔎 Detect</b> — identify unknown strings</summary><br>

| Tool | What it does |
| --- | --- |
| Detect | Paste anything — it guesses the format and jumps you to the right tool |

</details>

## 🌍 Languages

English · Deutsch · Español · Português · Русский · Türkçe · 日本語 · 한국어 · 中文

Nine languages, with the structure in place for more. Each is a single JSON file, downloaded only when selected.

## 🛠️ For developers

```bash
npm install
npm run dev            # web — http://localhost:5173
npm run dev:desktop    # desktop app (Tauri window)
npm run dev:extension  # browser extension
npm test               # core logic tests
npm run typecheck
npm run build          # web (static site)
npm run build:desktop  # desktop installers for the current OS
```

Requires Node 20+. Desktop builds also need the [Rust toolchain](https://www.rust-lang.org/tools/install) and Tauri's [system dependencies](https://tauri.app/start/prerequisites/). The published installers are built in CI: push a `v*` tag (or run the **release** workflow by hand) and GitHub Actions builds each platform on its own runner and attaches the packages to a release.

<details>
<summary><b>How it's put together</b></summary><br>

```
packages/core   Pure TypeScript. Every transformation lives here, with no
                reference to React or the DOM, so the same logic backs the web,
                desktop and extension builds alike.
apps/web        React + Vite. Reads the tool registry and does the rendering.
apps/desktop    The same UI wrapped in a Tauri window — Windows and Linux.
apps/extension  A Chrome/Edge side panel that reuses the web UI.
packaging/      winget, Scoop and Chrome Web Store manifests and listing copy.
```

Two rules keep it that way:

- **Core never speaks a human language.** Tools return `Result<T>` values, and failures carry an i18n key such as `error.invalidBase64` rather than an English sentence. Whoever renders the message translates it.
- **The registry is the single source of truth.** [`apps/web/src/tools/registry.ts`](apps/web/src/tools/registry.ts) lists every tool; the sidebar, search and routes are all generated from it. Adding a tool means one entry and one lazily-loaded component.

</details>

## 📄 License

MIT — see [LICENSE](./LICENSE). Built by [ensar.dev](https://ensar.dev).
