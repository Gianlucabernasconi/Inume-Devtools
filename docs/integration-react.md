# React integration

## Resumen

En React, el patrón mínimo es montar el overlay dentro de un `useEffect()` client-side con import dinámico.

---

## Snippet recomendado

```tsx
import { useEffect } from 'react'

export function App() {
  useEffect(() => {
    let cancelled = false
    let handle

    async function mountDevtool() {
      if (!import.meta.env.DEV || typeof window === 'undefined') {
        return
      }

      const { mountCssVarsDevtool } = await import('@inume/css-vars-devtools/browser')
      if (cancelled) {
        return
      }

      handle = mountCssVarsDevtool({
        prefixes: ['--color-'],
        locale: 'auto',
        productionGuard: 'strict'
      })
    }

    void mountDevtool()
    return () => {
      cancelled = true
      handle?.destroy()
    }
  }, [])

  return null
}
```

---

## Consideraciones

- monta el overlay una sola vez por app
- mantén el import dinámico dentro del efecto
- destruye el handle en el cleanup del efecto
- no lo conviertas en un componente productivo del árbol UI

---

## Sample del repo

Ver:

- `examples/react/index.html`
- `examples/react/src/main.jsx`
- `examples/react/src/App.jsx`
- `examples/react/src/styles.css`
