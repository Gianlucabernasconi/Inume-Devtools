# Nuxt integration

## Resumen

En Nuxt, la forma más limpia es un plugin `.client` que además valide `import.meta.dev`.

---

## Snippet recomendado

```ts
export default defineNuxtPlugin(async () => {
  if (!import.meta.dev || typeof window === 'undefined') {
    return
  }

  const { mountCssVarsDevtool } = await import('inume-devtools/browser')

  mountCssVarsDevtool({
    prefixes: ['--color-'],
    locale: 'auto',
    productionGuard: 'strict'
  })
})
```

---

## Dónde ponerlo

- `plugins/css-vars-devtools.client.ts`

---

## Consideraciones

- `.client` evita SSR para el plugin
- `import.meta.dev` mantiene la integración fuera de producción
- el overlay sigue siendo un concern del navegador, no de Nitro ni del server runtime
