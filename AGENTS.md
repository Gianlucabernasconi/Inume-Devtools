# AGENTS.md

## Estado real del repo

- Este repo ya **no es documentation-only**. Hoy existe implementación real del paquete, código fuente, tests, samples, tooling y documentación.
- Stack real presente: `typescript`, `tsup`, `vitest`, `playwright`, `eslint`.
- Estructura real presente: `src/shared`, `src/core`, `src/browser`, `tests`, `examples`, `docs`.
- No asumas que la implementación actual ya está 100% alineada con la spec: todavía hay gaps de hardening y contrato público que deben verificarse contra las fuentes de verdad antes de tocar APIs o marcar release.

## Naturaleza del producto

- Este proyecto debe tratarse siempre como **producto real**, no como demo, MVP, prototipo ni playground desechable.
- Toda implementación, sample, test page, overlay, flujo UX y decisión de alcance debe pensarse como parte de un producto final usable en trabajo real.
- Reducir el alcance a una demo visual, a un caso juguete o a una mini prueba que no represente uso real del producto es un **error crítico**.
- Si una solución solo funciona para un escenario mínimo artificial y no para el uso real esperado del producto, no se considera válida.

## Fuentes de verdad

- `@inume-css-vars-devtools-especificacion-final-v1.md`: contrato técnico principal. Si hay conflicto, manda este archivo.
- `@inume-css-vars-devtools-contexto-producto-para-llms.md`: define alcance, no-objetivos y criterio de producto.
- `@inume-css-vars-devtools-ux-y-usabilidad-v1.md`: manda solo sobre superficie e interacciones del overlay.

## Boundaries cerrados de v1

- El producto es `@inume/css-vars-devtools`: librería npm pública, framework-agnostic, no una app final.
- v1 tiene dos entrypoints públicos: `@inume/css-vars-devtools` y `@inume/css-vars-devtools/browser`. No soportar deep imports.
- Soporte oficial v1: `Document` sobre `document.documentElement` / `:root`. No ampliar a `HTMLElement` por iniciativa propia.
- El `core` es headless; el overlay `browser` es opcional. No mezclar UI, storage ni concerns de browser dentro del core.
- No introducir adapters oficiales por framework ni framework UI para el overlay en v1.

## Invariantes que no se deben romper

- Baseline inmutable por sesión.
- Discovery snapshot único al crear la sesión; sin refresh automático, observers ni re-scans reactivos en v1.
- El default contractual de discovery en v1 es `--color-*`; no ampliar por defecto a custom properties arbitrarias.
- `resetVar()` y `resetAll()` vuelven al baseline de esa sesión.
- `destroy()` deja contratos estables de no-op/vacíos; no inventar side effects extra.
- El export público sale del estado en memoria de la sesión, no releyendo el DOM.
- Solo valores exportables pueden salir en `exportCss()` y `exportJson()`.

## Reglas del entry `browser`

- Debe ser `client-only`, `dev-only`, SSR-safe al importarse e inert al importarse.
- No tocar `window`, `document`, `navigator`, storage ni `ShadowRoot` en top-level; solo dentro de `mountCssVarsDevtool()`.
- Implementación cerrada de v1: TypeScript + vanilla DOM API + Shadow DOM. No meter Vue/React/Svelte para el overlay.
- Persistencia pertenece solo a `browser` y es opt-in.
- `productionGuard` por defecto es `strict`, pero no reemplaza el import dinámico dev-only del host.

## Integración recomendada del host

- El patrón oficial es import dinámico solo en desarrollo:

```ts
if (import.meta.env.DEV && typeof window !== 'undefined') {
  const { mountCssVarsDevtool } = await import('@inume/css-vars-devtools/browser')
  mountCssVarsDevtool({ prefixes: ['--color-'], locale: 'auto', productionGuard: 'strict' })
}
```

## Scaffold y tooling a crear cuando toque implementar

- Stack base esperado: `typescript`, `tsup`, `vitest`, `happy-dom` o `jsdom`, `playwright`.
- Estructura objetivo mínima: `src/shared`, `src/core`, `src/browser`, `tests`, `examples`, `docs`.
- Antes de pensar en publish, validar con `npm pack`.

## Hardening previo a publicación

- No asumir que la fase activa es siempre “publicar” solo porque ya exista build funcional.
- Si hay conflicto entre spec, tests, docs y comportamiento real, primero manda el hardening del contrato público.
- Antes de publicar, revisar explícitamente:
  - default real de discovery vs spec `--color-*`
  - cantidad real de entrypoints públicos exportados
  - teardown completo de listeners/browser resources en `destroy()`
  - documentación de integración alineada con el comportamiento real del código

## Orden correcto de implementación

- No empieces por la UI. Primero: packaging, tipos públicos, utilidades puras, discovery, sesión headless, export, tests del core.
- Después: sample `vanilla`, `productionGuard`, overlay browser, storage/i18n/copy, smoke tests reales de navegador, docs.

## Qué no asumir ni agregar por defecto

- No reescribir archivos CSS del host.
- No persistir automáticamente en cada cambio visual.
- No escanear el DOM constantemente.
- No agregar callbacks, event bus, plugin API, adapters ni `matchAll` en v1.
- No ampliar v1 a custom properties arbitrarias: el default correcto es `--color-*`.

## Seguimiento de avance obligatorio

- Cada vez que se complete una fase, subfase o bloque relevante del roadmap, se debe actualizar `ESTADO_ACTUAL.md` en el mismo trabajo.
- No marcar una fase como completada si el estado real del repo no la respalda con implementación y validación razonable.
- Si cambia la fase activa del proyecto, también debe actualizarse la sección correspondiente en `ESTADO_ACTUAL.md`.
