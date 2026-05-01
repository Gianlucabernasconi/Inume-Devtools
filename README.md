# `inume-devtools`

Framework-agnostic developer tool for discovering, editing, previewing, and exporting runtime CSS color variables.

`inume-devtools` is made for development workflows. It gives you a headless session API plus an optional browser overlay so you can inspect and tune CSS custom properties directly on the page.

## What You Get

- one-shot discovery of color-like CSS custom properties on `:root`
- filtering by `prefixes`, `include`, `exclude`, and `match`
- immutable baseline per session
- runtime editing through a headless API
- stable CSS and JSON exports from in-memory state
- optional browser overlay with search, picker, reset, copy, download, and opt-in persistence

## Installation

```bash
npm install inume-devtools
```

## Public Entrypoints

| Entrypoint | Purpose |
|---|---|
| `inume-devtools` | Headless session API |
| `inume-devtools/browser` | Optional browser overlay |

No deep imports are supported.

## Quick Start

### Headless API

```ts
import { createCssVarsSession } from 'inume-devtools'

const session = createCssVarsSession({
  prefixes: ['--color-']
})

session.setVar('--color-primary', '#8b5cf6')

console.log(session.exportCss())
console.log(session.exportJson())
```

### Browser Overlay

Recommended host pattern:

```ts
if (import.meta.env.DEV && typeof window !== 'undefined') {
  const { mountCssVarsDevtool } = await import('inume-devtools/browser')

  mountCssVarsDevtool({
    prefixes: ['--color-'],
    locale: 'auto',
    productionGuard: 'strict'
  })
}
```

`productionGuard` is a runtime safety layer. It does not replace a dev-only dynamic import in the host app.

## Core API

### `createCssVarsSession(options?)`

Creates a headless session bound to a `Document` target.

| Option | Type | Notes |
|---|---|---|
| `target` | `Document` | Defaults to the global `document` when available |
| `prefixes` | `string[]` | Narrows discovery by custom property name |
| `include` | `string[]` | Exact custom property names to include |
| `exclude` | `string[]` | Exact custom property names to exclude |
| `match` | `(name: string) => boolean` | Final filter step |
| `allowRaw` | `boolean` | Allows non-exportable working values in memory |

Default discovery is broad by runtime value: custom properties are included when their computed value is recognized as a color. Use `prefixes` when you want to narrow the scope, for example to `['--color-']`.

| Method | Description |
|---|---|
| `getVars()` | Returns a fresh, lexicographically sorted snapshot |
| `getVar(name)` | Returns one variable or `undefined` |
| `setVar(name, value)` | Updates in-memory state and the DOM target |
| `resetVar(name)` | Restores one variable to the session baseline |
| `resetAll()` | Restores the full scope to baseline |
| `exportCss()` | Returns a stable `:root { ... }` block |
| `exportJson()` | Returns a stable JSON export schema string |
| `destroy()` | Leaves the session inert and idempotent |

## Browser API

### `mountCssVarsDevtool(options?)`

Mounts the optional browser overlay.

| Option | Type | Notes |
|---|---|---|
| `session` | `CssVarsSession` | Uses an external session instead of creating one |
| `storage` | `false \| { kind?: 'local' \| 'session'; key?: string }` | Opt-in persistence |
| `locale` | `'auto' \| 'en' \| 'es'` | Message resolution |
| `messages` | `Partial<CssVarsMessages>` | Overrides locale strings |
| `title` | `string` | Used as accessible label and download base name |
| `productionGuard` | `'strict' \| 'warn' \| 'off'` | Runtime guard for host environments |
| `defaultOpen` | `boolean` | Opens the overlay on mount |

| Method | Description |
|---|---|
| `show()` | Opens the panel |
| `hide()` | Hides the panel |
| `toggle()` | Toggles panel visibility |
| `clearPersisted()` | Clears this handle storage namespace |
| `destroy()` | Unmounts the overlay and owned browser resources |

## Production Guard

| Mode | Behavior |
|---|---|
| `strict` | Blocks non-loopback hosts and returns an inert handle |
| `warn` | Mounts but logs a warning outside loopback |
| `off` | Performs no host check |

Loopback hosts accepted by `strict`:

- `localhost`
- `127.0.0.1`
- `::1`

## Security Notes

- the browser overlay is isolated with Shadow DOM
- configurable text is rendered as plain text, not as HTML
- exports only include values validated as exportable
- dangerous tokens like `url(`, `expression(`, `@`, `;`, and CSS comments are rejected from public exports
- copy and download only happen from explicit user interaction
- persistence is opt-in and scoped to exportable values

## Supported Formats

Exportable today:

- `#rgb`
- `#rgba`
- `#rrggbb`
- `#rrggbbaa`
- `rgb()`
- `rgba()`
- `hsl()`
- `hsla()`

If `allowRaw: true` is enabled, the session can keep non-exportable values in memory, but they stay out of `exportCss()` and `exportJson()`.

## Integration Guides

- [`docs/quick-start.es.md`](docs/quick-start.es.md)
- [`docs/integration-vite.md`](docs/integration-vite.md)
- [`docs/integration-react.md`](docs/integration-react.md)
- [`docs/integration-nuxt.md`](docs/integration-nuxt.md)
- [`docs/architecture.md`](docs/architecture.md)

## Repository Scripts

```bash
npm run build
npm run check
npm test
npm run test:smoke
npm run lint
```
