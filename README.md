# `@inume/css-vars-devtools`

![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)
![Vitest](https://img.shields.io/badge/tests-vitest-6E9F18?logo=vitest)
![Playwright](https://img.shields.io/badge/smoke-playwright-45BA63?logo=playwright)
![License](https://img.shields.io/badge/license-MIT-blue)

Framework-agnostic developer tool for discovering, editing, previewing, and exporting **runtime CSS color variables**.

> Current status: the package is already functional and documented, but it still has a small set of **pre-release hardening tasks** before v1 should be considered publish-ready.

---

## Table of contents

- [What it does](#what-it-does)
- [What it does not do](#what-it-does-not-do)
- [Package entrypoints](#package-entrypoints)
- [Installation](#installation)
- [Quick start](#quick-start)
- [Core API](#core-api)
- [Browser API](#browser-api)
- [Production guard](#production-guard)
- [Security notes](#security-notes)
- [Known pre-release gaps](#known-pre-release-gaps)
- [Supported formats](#supported-formats)
- [Integration samples](#integration-samples)
- [Repository scripts](#repository-scripts)
- [Architecture docs](#architecture-docs)

---

## What it does

`@inume/css-vars-devtools` is built for **development-time iteration**, not for production UI.

It currently provides:

- one-shot discovery of CSS custom properties from `document.documentElement`
- filtering by `prefixes`, `include`, `exclude`, and `match`
- an immutable per-session baseline
- runtime editing via a headless session API
- stable CSS and JSON exports from in-memory state
- an optional browser overlay with:
  - Shadow DOM isolation
  - draggable panel
  - variable search
  - active variable editor
  - reset / reset all
  - copy + download actions
  - opt-in storage
  - `en` / `es` messaging with `locale: 'auto'`

---

## What it does not do

This package does **not**:

- rewrite source CSS files
- parse full authored stylesheets
- ship framework-specific adapters
- watch the DOM reactively in v1
- act as a full design token manager
- replace host-side dev-only dynamic imports with `productionGuard`

---

## Package entrypoints

| Entrypoint | Purpose |
|---|---|
| `@inume/css-vars-devtools` | Headless session API |
| `@inume/css-vars-devtools/browser` | Browser overlay on top of the session API |

> No deep imports are supported.

> The intended public API surface for v1 is exactly the two entrypoints above.

---

## Installation

```bash
npm install @inume/css-vars-devtools
```

---

## Quick start

### Headless core

```ts
import { createCssVarsSession } from '@inume/css-vars-devtools'

const session = createCssVarsSession({
  prefixes: ['--color-'],
  allowRaw: false
})

session.setVar('--color-primary', '#8b5cf6')

const css = session.exportCss()
const json = session.exportJson()
```

### Browser overlay

Official integration pattern:

```ts
if (import.meta.env.DEV && typeof window !== 'undefined') {
  const { mountCssVarsDevtool } = await import('@inume/css-vars-devtools/browser')

  mountCssVarsDevtool({
    prefixes: ['--color-'],
    locale: 'auto',
    productionGuard: 'strict'
  })
}
```

> `productionGuard` is a runtime safety layer. It does **not** replace a dev-only dynamic import in the host app.

---

## Core API

### `createCssVarsSession(options?)`

Creates a headless session bound to a `Document` target.

#### Session options

| Option | Type | Notes |
|---|---|---|
| `target` | `Document` | Defaults to the global `document` when available |
| `prefixes` | `string[]` | Replaces the intended default `--color-` prefix set |
| `include` | `string[]` | Exact custom property names to include |
| `exclude` | `string[]` | Exact custom property names to exclude |
| `match` | `(name: string) => boolean` | Final filter step |
| `allowRaw` | `boolean` | Allows non-exportable working values in memory |

#### Session methods

| Method | Description |
|---|---|
| `getVars()` | Returns a fresh, lexicographically sorted snapshot |
| `getVar(name)` | Returns one variable or `undefined` |
| `setVar(name, value)` | Updates in-memory state and the DOM target |
| `resetVar(name)` | Restores a single variable to the session baseline |
| `resetAll()` | Restores the full scope to baseline |
| `exportCss()` | Returns a stable `:root { ... }` block |
| `exportJson()` | Returns a stable JSON export schema string |
| `destroy()` | Leaves the session inert and idempotent |

#### Example

```ts
import { createCssVarsSession } from '@inume/css-vars-devtools'

const session = createCssVarsSession({ include: ['--color-brand'] })

console.log(session.getVars())

session.setVar('--color-brand', 'rgb(139 92 246 / 1)')
session.resetVar('--color-brand')
```

---

## Browser API

### `mountCssVarsDevtool(options?)`

Mounts the optional browser overlay.

#### Browser options

| Option | Type | Notes |
|---|---|---|
| `session` | `CssVarsSession` | Uses an external session instead of creating one |
| `storage` | `false \| { kind?: 'local' \| 'session'; key?: string }` | Opt-in persistence |
| `locale` | `'auto' \| 'en' \| 'es'` | Message resolution |
| `messages` | `Partial<CssVarsMessages>` | Overrides locale strings |
| `title` | `string` | Overlay title and download base name |
| `productionGuard` | `'strict' \| 'warn' \| 'off'` | Runtime guard for host environments |
| `defaultOpen` | `boolean` | Opens the overlay on mount |

#### Handle methods

| Method | Description |
|---|---|
| `show()` | Opens the panel |
| `hide()` | Hides the panel |
| `toggle()` | Toggles panel visibility |
| `clearPersisted()` | Clears this handle storage namespace |
| `destroy()` | Unmounts the overlay and owned browser resources |

#### Example

```ts
import { createCssVarsSession } from '@inume/css-vars-devtools'
import { mountCssVarsDevtool } from '@inume/css-vars-devtools/browser'

const session = createCssVarsSession({ prefixes: ['--color-'] })

const handle = mountCssVarsDevtool({
  session,
  locale: 'en',
  storage: { kind: 'local', key: 'demo-devtool' },
  productionGuard: 'warn'
})

handle.show()
```

---

## Production guard

Supported modes:

| Mode | Behavior |
|---|---|
| `strict` | Blocks non-loopback hosts and returns an inert handle |
| `warn` | Mounts but logs a warning outside loopback |
| `off` | Performs no host check |

Loopback hosts accepted by `strict`:

- `localhost`
- `127.0.0.1`
- `::1`

---

## Security notes

- the browser overlay is isolated with **Shadow DOM**
- configurable text is rendered as plain text, not as HTML
- exports only include values validated as exportable
- dangerous tokens like `url(`, `expression(`, `@`, `;`, and CSS comments are rejected from public exports
- downloads use sanitized filenames with a fixed extension
- copy and download only happen from explicit user interaction

---

## Known pre-release gaps

The project is functional, but these points are still being hardened before release:

- the implementation/tests still need final alignment with the v1 default discovery scope (`--color-*`)
- browser teardown still needs final cleanup hardening for some global listeners/lifecycle paths
- some overlay status messages are not fully localized yet
- the React integration guidance should always destroy the mounted handle on cleanup
- the overlay works well today, but some hot interaction paths still have performance headroom

---

## Supported formats

### Exportable today

- `#rgb`
- `#rgba`
- `#rrggbb`
- `#rrggbbaa`
- `rgb()`
- `rgba()`
- `hsl()`
- `hsla()`

### Working raw values

If `allowRaw: true` is enabled, the session can keep non-exportable values in memory, but they are filtered out of `exportCss()` and `exportJson()`.

---

## Integration samples

| Sample | Path | Purpose |
|---|---|---|
| Vanilla | `examples/vanilla/` | Manual validation + smoke test base |
| Vite | `examples/vite/` | Minimal dev-only dynamic import guide |
| React | `examples/react/` | `useEffect` + dynamic import guide |
| Nuxt | `examples/nuxt/` | `.client` plugin integration guide |

Related docs:

- [`docs/integration-vanilla.md`](docs/integration-vanilla.md)
- [`docs/integration-vite.md`](docs/integration-vite.md)
- [`docs/integration-react.md`](docs/integration-react.md)
- [`docs/integration-nuxt.md`](docs/integration-nuxt.md)

---

## Repository scripts

```bash
npm run build
npm run check
npm test
npm run test:smoke
npm run lint
```

---

## Architecture docs

- [`docs/architecture.md`](docs/architecture.md)
- [`docs/quick-start.es.md`](docs/quick-start.es.md)
