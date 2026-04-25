# Vanilla integration

## Resumen

La integración `vanilla` es la referencia más directa del repo porque usa:

- un documento HTML simple
- CSS vars en `:root`
- `createCssVarsSession()` de forma explícita
- import dinámico del entry `browser`

---

## Archivos del sample

| Archivo | Rol |
|---|---|
| `examples/vanilla/index.html` | UI manual de prueba |
| `examples/vanilla/app.js` | Session headless + acciones manuales |
| `examples/vanilla/styles.css` | Variables y estilos de preview |

---

## Flujo validado

1. crea una sesión explícita con `prefixes: ['--color-']`
2. edita colores desde inputs nativos
3. exporta CSS y JSON desde memoria
4. carga el overlay browser con import dinámico solo en `localhost`

---

## Ejemplo clave

```js
import { createCssVarsSession } from '../../dist/index.js'

const session = createCssVarsSession({ prefixes: ['--color-'] })

if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
  const { mountCssVarsDevtool } = await import('../../dist/browser.js')
  mountCssVarsDevtool({ prefixes: ['--color-'], productionGuard: 'strict' })
}
```

---

## Uso recomendado

Este sample sirve como base para:

- validación manual del core
- smoke tests reales con Playwright
- depuración rápida del overlay browser

> Importante: aunque el sample actual del repo todavía tenga decisiones internas en revisión, la integración recomendada y el contrato esperado de v1 siguen siendo trabajar de forma explícita con `['--color-']` cuando quieras limitar el scope al comportamiento oficial.
