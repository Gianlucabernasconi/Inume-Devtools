# Vite sample

Integración mínima para un proyecto Vite con `@inume/css-vars-devtools`.

## Qué muestra

- uso de CSS vars en `:root`
- render simple con JavaScript vanilla
- import dinámico del entry `browser` solo en desarrollo

## Archivos clave

- `index.html`
- `main.js`
- `styles.css`

## Punto importante

La integración sigue el patrón oficial:

```ts
if (import.meta.env.DEV && typeof window !== 'undefined') {
  const { mountCssVarsDevtool } = await import('@inume/css-vars-devtools/browser')
  mountCssVarsDevtool({ prefixes: ['--color-'], locale: 'auto', productionGuard: 'strict' })
}
```
