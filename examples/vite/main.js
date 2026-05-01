const app = document.querySelector('#app')

app.innerHTML = `
  <main class="shell">
    <section class="card">
      <p class="eyebrow">Vite sample</p>
      <h1>Dynamic import in dev only</h1>
      <p class="copy">
        This sample shows the official integration pattern for <code>inume-devtools/browser</code>
        in a Vite app.
      </p>
      <button class="cta" type="button">Primary action</button>
    </section>
  </main>
`

if (import.meta.env.DEV && typeof window !== 'undefined') {
  const { mountCssVarsDevtool } = await import('inume-devtools/browser')

  mountCssVarsDevtool({
    prefixes: ['--color-'],
    locale: 'auto',
    productionGuard: 'strict'
  })
}
