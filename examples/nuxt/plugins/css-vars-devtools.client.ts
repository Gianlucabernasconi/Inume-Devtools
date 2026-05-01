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
