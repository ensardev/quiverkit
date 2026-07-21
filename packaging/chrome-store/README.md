# Chrome Web Store listing

How the store listing is localized, and the copy for every language in one place.

## What localizes automatically

The extension **name** and the **short summary** come from the manifest via
`_locales/<lang>/messages.json` (`appName`, `appDescription`). Chrome shows them
in the viewer's language with no dashboard work — all nine languages are already
covered there.

## What you enter by hand, per language

The **detailed description** (the long body of the listing) is *not* taken from
`_locales`. Set it in the Developer Dashboard:

1. Open the item → **Store listing**.
2. Use the **language dropdown** (top of the page) → **Add language**.
3. For each language, paste the **Detailed description** from
   [`listing/<lang>.md`](./listing). Leave name/summary blank — they fall back to
   the localized `_locales` values.
4. Screenshots can stay the same across languages (they're largely visual). Localize
   them later only if you want language-specific captions.

Store locale codes used here: `en`, `tr`, `de`, `es`, `pt-BR`, `ru`, `ja`, `ko`,
`zh-CN` — matching the extension's `_locales` (`pt_BR` → `pt-BR`, `zh_CN` → `zh-CN`).

## Assets

Screenshots (1280×800), the small promo tile (440×280) and the 128×128 icon are
generated from the HTML mockups in [`assets/`](./assets); re-render them with
headless Chrome (`--window-size=1280,800 --screenshot=out.png file.html`).
