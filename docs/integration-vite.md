# Vite integration

## Resumen

Para Vite, el patrón recomendado es un **import dinámico dev-only** desde un módulo client-side.

---

## Snippet recomendado

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

---

## Dónde ponerlo

Opciones comunes:

- en `main.ts` o `main.js`
- en un módulo bootstrap que corra una sola vez al iniciar la app

---

## Consideraciones

- no importes `inume-devtools/browser` en top-level si quieres mantener la separación dev-only
- `productionGuard` es complementario, no sustituto del guard de Vite
