# Vanilla integration

## Resumen

Si tu proyecto no usa framework, la integración recomendada es exactamente la misma idea base:

- crear la sesión sobre `document`
- limitar el scope con `prefixes` cuando corresponda
- montar el overlay browser solo en desarrollo

---

## Snippet recomendado

```html
<script type="module">
  import { createCssVarsSession } from 'inume-devtools'

  const session = createCssVarsSession({ prefixes: ['--color-'] })

  if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
    const { mountCssVarsDevtool } = await import('inume-devtools/browser')

    mountCssVarsDevtool({
      session,
      locale: 'auto',
      productionGuard: 'strict'
    })
  }

  window.devtoolSession = session
</script>
```

---

## Consideraciones

- usa import dinámico para mantener el overlay fuera de producción
- `productionGuard` complementa, pero no reemplaza, ese guard de desarrollo
- el target oficial de v1 es `document.documentElement` / `:root`
- `exportCss()` y `exportJson()` salen del estado en memoria de la sesión
