# Vanilla sample

Sample mínimo para validar manualmente el core headless sobre un documento HTML simple.

## Qué valida

- discovery sobre `document.documentElement`
- edición runtime de `--color-*`
- `resetVar()` y `resetAll()`
- `exportCss()` y `exportJson()` desde memoria
- patrón oficial de import dinámico para `@inume/css-vars-devtools/browser`

## Cómo usarlo

1. Ejecuta `npm run build` en la raíz del repo.
2. Sirve esta carpeta con cualquier servidor estático.
3. Abre `examples/vanilla/index.html` desde esa URL.

## Checklist manual sugerido

1. Cambiar un color desde los inputs y verificar que la UI cambie al instante.
2. Revisar que el bloque CSS cambie sin releer el DOM.
3. Usar `Reset` y `Reset all`.
4. Confirmar que el JSON exportado omite ruido y mantiene orden estable.
5. Abrir en `localhost` y verificar que el import dinámico del entry `browser` cargue sin romper la página.

## Nota

El overlay browser ya existe. Este sample sigue siendo útil porque valida el core headless de forma explícita y también sirve como base de smoke tests reales con Playwright.
