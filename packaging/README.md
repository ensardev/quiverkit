# Packaging

Manifests for the Windows package managers. Both point at the `x64` NSIS
installer (`QuiverKit_<version>_x64-setup.exe`) attached to the GitHub release.

> These only work once the release is **published** (not a draft) and the repo is
> **public** — package managers download the asset over an anonymous URL.

Every release, bump the version and the SHA-256 in each manifest. Get the hash
from the release:

```bash
gh api repos/ensardev/quiverkit/releases \
  -q '.[] | select(.tag_name=="v0.1.0") | .assets[] | "\(.name)  \(.digest)"'
```

## winget

Files in [`winget/`](./winget) follow the multi-file manifest format
(`ensardev.QuiverKit`). To publish:

1. Validate and test locally:
   ```bash
   winget validate --manifest packaging/winget
   winget install --manifest packaging/winget
   ```
2. Submit a PR to [microsoft/winget-pkgs](https://github.com/microsoft/winget-pkgs),
   placing the three files under
   `manifests/e/ensardev/QuiverKit/0.1.0/`. The [wingetcreate](https://github.com/microsoft/winget-create)
   tool automates this: `wingetcreate update ensardev.QuiverKit --version 0.1.0 --urls <installer-url>`.

winget is the natural fit here — it runs the installer silently and tracks it in
Apps & Features.

## Scoop

[`scoop/quiverkit.json`](./scoop/quiverkit.json) unpacks the NSIS installer with
7-Zip (`#/dl.7z`) and runs the app portably, so nothing is installed system-wide.
It is a GUI app, so it belongs in an **extras**-style bucket, not the main one.

Options:

- Host our own bucket (e.g. a `scoop-quiverkit` repo) and tell users:
  ```
  scoop bucket add quiverkit https://github.com/ensardev/scoop-quiverkit
  scoop install quiverkit
  ```
- Or submit to [ScoopInstaller/Extras](https://github.com/ScoopInstaller/Extras).

Test before publishing — confirm `QuiverKit.exe` lands at the archive root after
extraction:

```bash
scoop install ./packaging/scoop/quiverkit.json
```

`checkver`/`autoupdate` are wired to the GitHub releases, so a bucket bot can bump
the version and hash automatically on each new tag.
