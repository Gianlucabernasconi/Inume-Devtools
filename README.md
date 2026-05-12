# `inume-devtools`

![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)
![Vitest](https://img.shields.io/badge/tests-vitest-6E9F18?logo=vitest)
![Playwright](https://img.shields.io/badge/smoke-playwright-45BA63?logo=playwright)
![License](https://img.shields.io/badge/license-MIT-blue)

Framework-agnostic developer tool for discovering, editing, previewing, and exporting **runtime CSS color variables**.

> Current status: v1 is already public on npm as [`inume-devtools`](https://www.npmjs.com/package/inume-devtools). This repository is now preparing v1.1.

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

`inume-devtools` is built for **development-time iteration**, not for production UI.

It currently provides:

- one-shot discovery of CSS custom properties from `document.documentElement` and optional scoped selectors
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
- ship framework-specific adapters beyond the official Next.js convenience entrypoint
- watch the DOM reactively in v1
- act as a full design token manager
- replace host-side dev-only dynamic imports with `productionGuard`

---

## Package entrypoints

| Entrypoint | Purpose |
|---|---|
| `inume-devtools` | Headless session API |
| `inume-devtools/browser` | Browser overlay on top of the session API |
| `inume-devtools/next` | Client Component convenience entrypoint for Next.js |

> No deep imports are supported.

> No deep imports are supported beyond the documented entrypoints.

---

## Installation

```bash
npm install inume-devtools
```

---

## Quick start

### Headless core

```ts
import { createCssVarsSession } from 'inume-devtools'

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
  const { mountCssVarsDevtool } = await import('inume-devtools/browser')

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
| `scopes` | `string[]` | Additional CSS selectors to scan after `:root` |
| `prefixes` | `string[]` | Narrows discovery to custom property names with these prefixes |
| `include` | `string[]` | Exact custom property names to include |
| `exclude` | `string[]` | Exact custom property names to exclude |
| `match` | `(name: string) => boolean` | Final filter step |
| `allowRaw` | `boolean` | Allows non-exportable working values in memory |

By default, discovery is broad by runtime value: it includes CSS custom properties whose computed value is recognized as a color. Use `prefixes` when you want to narrow that scope, for example to `['--color-']`.

`scopes` adds selector-based discovery for tokens scoped outside `:root`:

```ts
const session = createCssVarsSession({
  scopes: ['.landing', '.dark', '[data-theme="brand"]'],
  prefixes: ['--color-']
})
```

`:root` is always scanned first. `scopes` is still a one-shot snapshot: selectors added later to the DOM are not discovered automatically.

#### Session methods

| Method | Description |
|---|---|
| `getVars()` | Returns a fresh, lexicographically sorted snapshot |
| `getVar(name, options?)` | Returns one variable or `undefined` |
| `setVar(name, value, options?)` | Updates in-memory state and the DOM target |
| `resetVar(name, options?)` | Restores a single variable to the session baseline |
| `resetAll()` | Restores the full scope to baseline |
| `exportCss()` | Returns stable CSS grouped by selector |
| `exportJson()` | Returns a stable JSON export schema string |
| `destroy()` | Leaves the session inert and idempotent |

#### Example

```ts
import { createCssVarsSession } from 'inume-devtools'

const session = createCssVarsSession({ include: ['--color-brand'] })

console.log(session.getVars())

session.setVar('--color-brand', 'rgb(139 92 246 / 1)')
session.resetVar('--color-brand')

session.setVar('--color-brand', '#111827', { scope: '.dark' })
```

Scoped exports are grouped by selector:

```css
:root {
  --color-primary: #4f46e5;
}

.dark {
  --color-primary: #ffffff;
}
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
import { createCssVarsSession } from 'inume-devtools'
import { mountCssVarsDevtool } from 'inume-devtools/browser'

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

## Next.js

Use the official convenience Client Component from `inume-devtools/next`:

```tsx
import { InumeDevtools } from 'inume-devtools/next'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        {process.env.NODE_ENV === 'development' ? (
          <InumeDevtools scopes={['.landing', '.dark']} prefixes={['--color-']} />
        ) : null}
      </body>
    </html>
  )
}
```

The entrypoint is SSR-safe at import time. It mounts the browser overlay only from a client effect and destroys the handle on cleanup.

---

## pnpm monorepos

Install the package in the workspace that runs the web app, not necessarily in the monorepo root:

```bash
pnpm --filter web add -D inume-devtools
```

Alternative:

```bash
cd web
pnpm add -D inume-devtools
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
| Next.js | `docs/integration-next.md` | Official `inume-devtools/next` Client Component guide |
| Nuxt | `examples/nuxt/` | `.client` plugin integration guide |

Related docs:

- [`docs/integration-vanilla.md`](docs/integration-vanilla.md)
- [`docs/integration-vite.md`](docs/integration-vite.md)
- [`docs/integration-react.md`](docs/integration-react.md)
- [`docs/integration-next.md`](docs/integration-next.md)
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
