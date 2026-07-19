# QuiverKit

**Developer tools that never leave your browser.**

Base64, JSON, UUIDs and more — every tool runs entirely on your own machine. No
upload, no account, no tracking. Open the network tab and check.

Most online dev tools ask you to paste a production JWT, a customer payload or an
internal config into someone else's server. QuiverKit exists so you never have to.

## Tools

| Tool | What it does |
| --- | --- |
| Base64 | Encode and decode, URL-safe variant, full Unicode support |
| JSON Formatter | Format, minify, sort keys alphabetically |
| UUID Generator | UUID v4, time-ordered UUID v7, Nano ID |

More on the way.

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

MIT
