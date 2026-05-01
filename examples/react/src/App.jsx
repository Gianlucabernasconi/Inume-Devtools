import { useEffect } from 'react'

export default function App() {
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

  return (
    <main className="shell">
      <section className="card">
        <p className="eyebrow">React sample</p>
        <h1>Dev-only dynamic import inside React</h1>
        <p className="copy">
          The browser overlay is mounted only on the client and only during development.
        </p>
        <button className="cta" type="button">
          Primary action
        </button>
      </section>
    </main>
  )
}
