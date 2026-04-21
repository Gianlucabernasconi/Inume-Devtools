# `@inume/css-vars-devtools`

Librería framework-agnostic para descubrir, editar y exportar CSS custom properties de color en runtime durante desarrollo.

## Estado

El repo ya incluye el scaffold inicial, el core headless de v1 y tests dirigidos del contrato base.

## Entrypoints públicos

- `@inume/css-vars-devtools`
- `@inume/css-vars-devtools/browser`

## Scripts

- `npm run build`
- `npm run check`
- `npm test`

## Alcance actual

- discovery one-shot sobre `Document`
- baseline inmutable por sesión
- `setVar`, `resetVar`, `resetAll`
- `exportCss()` y `exportJson()` filtrando valores exportables
- entry `browser` exportado y SSR-safe al importarse

La UI overlay todavía no está implementada en esta primera iteración.
