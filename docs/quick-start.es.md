# Quick start — `@inume/css-vars-devtools`

> Versión corta en español del uso actual del paquete.

---

## Tabla de contenidos

- [Qué resuelve](#qué-resuelve)
- [Instalación](#instalación)
- [Uso headless](#uso-headless)
- [Uso del overlay browser](#uso-del-overlay-browser)
- [Notas importantes](#notas-importantes)
- [Guías relacionadas](#guías-relacionadas)

---

## Qué resuelve

Permite:

- descubrir variables CSS de color en `:root`
- editarlas en runtime
- resetear contra un baseline estable
- exportarlas como CSS y JSON
- montar un overlay opcional solo para desarrollo

---

## Instalación

```bash
npm install @inume/css-vars-devtools
```

---

## Uso headless

```ts
import { createCssVarsSession } from '@inume/css-vars-devtools'

const session = createCssVarsSession({
  prefixes: ['--color-']
})

session.setVar('--color-primary', '#8b5cf6')

console.log(session.exportCss())
console.log(session.exportJson())
```

---

## Uso del overlay browser

Patrón recomendado:

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

---

## Notas importantes

- el overlay es **dev-only** por diseño
- `productionGuard` no reemplaza el import dinámico del host
- el soporte oficial actual está cerrado sobre `Document` / `document.documentElement`
- los exports públicos filtran valores no exportables
- la persistencia del overlay es **opt-in** mediante `storage`

---

## Guías relacionadas

- [`integration-vanilla.md`](integration-vanilla.md)
- [`integration-vite.md`](integration-vite.md)
- [`integration-react.md`](integration-react.md)
- [`integration-nuxt.md`](integration-nuxt.md)
- [`architecture.md`](architecture.md)
