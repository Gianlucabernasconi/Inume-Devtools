# Architecture

## Table of contents

- [Overview](#overview)
- [Layer boundaries](#layer-boundaries)
- [Runtime flow](#runtime-flow)
- [Module map](#module-map)
- [State and lifecycle](#state-and-lifecycle)
- [Browser overlay responsibilities](#browser-overlay-responsibilities)
- [Validation and export pipeline](#validation-and-export-pipeline)
- [Testing strategy](#testing-strategy)

---

## Overview

`@inume/css-vars-devtools` is split into two public layers:

1. a **headless core** for discovery, session state, reset, and export
2. an optional **browser overlay** for dev-only interaction

This keeps the state model reusable while isolating UI, storage, and browser-only concerns.

---

## Layer boundaries

| Layer | Responsibilities | Examples |
|---|---|---|
| `src/shared` | types, normalization, validation, serialization | `types.ts`, `validate-exportable-value.ts` |
| `src/core` | discovery, baseline, session state, exports | `discover-vars.ts`, `create-session.ts` |
| `src/browser` | overlay UI, i18n, storage, downloads, production guard | `create-overlay.ts`, `storage.ts`, `i18n.ts` |

---

## Runtime flow

```mermaid
flowchart TD
  A[Host app with CSS vars] --> B[createCssVarsSession]
  B --> C[discoverVars one-shot]
  C --> D[baseline map]
  D --> E[current in-memory state]
  E --> F[exportCss / exportJson]
  E --> G[mountCssVarsDevtool]
  G --> H[Shadow DOM overlay]
  H --> I[storage / i18n / copy / download]
```

---

## Module map

```text
src/
  shared/
    constants.ts
    normalize-color.ts
    normalize-name.ts
    serialize-css.ts
    serialize-json.ts
    types.ts
    validate-exportable-value.ts
  core/
    discover-vars.ts
    filters.ts
    create-session.ts
  browser/
    create-overlay.ts
    download.ts
    i18n.ts
    mount-devtool.ts
    production-guard.ts
    storage.ts
    storage-schema.ts
    styles.ts
```

---

## State and lifecycle

### Core session

- baseline is captured once during discovery
- current values live in memory
- `resetVar()` and `resetAll()` restore the baseline
- `destroy()` makes the session inert

### Browser handle

- may own its session or consume an external one
- unmounts overlay resources on `destroy()`
- keeps browser-only concerns out of the core

---

## Browser overlay responsibilities

Current browser responsibilities implemented in code:

- Shadow DOM UI isolation
- floating toggle button and draggable panel
- active variable editing through native color input
- variable filtering and selection
- copy/download actions
- opt-in persistence
- locale resolution and message merging
- production guard evaluation before mounting

---

## Validation and export pipeline

### Validation

`validateExportableValue()` currently accepts:

- hex colors
- `rgb()` / `rgba()`
- `hsl()` / `hsla()`

It rejects dangerous tokens such as:

- `url(`
- `expression(`
- `@`
- `;`
- CSS comments

### Export

- `serializeCss()` emits a stable `:root { ... }` block
- `serializeJson()` emits a stable JSON schema with `version` + `vars`
- non-exportable raw values stay out of public exports

---

## Testing strategy

| Level | Tool | Scope |
|---|---|---|
| Unit / contract | Vitest + happy-dom | core logic, browser contracts, overlay behaviors |
| Real browser smoke | Playwright | discovery, copy, download, overlay basics through `examples/vanilla` |

Current scripts:

```bash
npm test
npm run test:smoke
```
