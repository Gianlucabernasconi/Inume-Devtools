import { describe, expect, it } from 'vitest'

import { createCssVarsSession } from '../src/index'

function setupDocument(): Document {
  document.documentElement.innerHTML = ''
  document.documentElement.style.cssText = ''
  document.documentElement.style.setProperty('--color-base', '#ffffff')
  document.documentElement.style.setProperty('--color-primary', 'rgb(0 0 0 / 1)')
  document.documentElement.style.setProperty('--color-spacing', '16px')
  document.documentElement.style.setProperty('--bg-page', '#121826')
  document.documentElement.style.setProperty('--text-muted', '#7c89a0')
  document.documentElement.style.setProperty('--space-md', '16px')
  return document
}

function setupScopedDocument(): Document {
  setupDocument()
  document.body.replaceChildren()

  const landing = document.createElement('main')
  landing.className = 'landing'
  landing.style.setProperty('--color-hero-bg', '#101820')
  landing.style.setProperty('--color-primary', '#334455')
  landing.style.setProperty('--space-lg', '32px')

  const dark = document.createElement('section')
  dark.dataset.theme = 'dark'
  dark.style.setProperty('--color-primary', '#f8fafc')

  document.body.append(landing, dark)
  return document
}

describe('createCssVarsSession', () => {
  it('descubre cualquier custom property real cuyo valor runtime sea color', () => {
    const session = createCssVarsSession({ target: setupDocument() })

    expect(session.getVars().map((item) => item.name)).toEqual([
      '--bg-page',
      '--color-base',
      '--color-primary',
      '--text-muted'
    ])
  })

  it('discovery amplio no incluye custom properties sin valor runtime de color', () => {
    const session = createCssVarsSession({ target: setupDocument() })

    expect(session.getVar('--color-spacing')).toBeUndefined()
    expect(session.getVar('--space-md')).toBeUndefined()
  })

  it('no inventa custom properties a partir de propiedades nativas del navegador', () => {
    const session = createCssVarsSession({ target: setupDocument() })

    expect(session.getVars().some((item) => item.name === '--color-interpolation')).toBe(false)
    expect(session.getVars().some((item) => item.name === '--color-scheme')).toBe(false)
  })

  it('prefixes restringe el scope a los prefijos configurados', () => {
    const session = createCssVarsSession({
      target: setupDocument(),
      prefixes: ['--space-']
    })

    expect(session.getVars()).toEqual([])
  })

  it('prefixes acota el discovery amplio por nombre sin cambiar la validación por color', () => {
    const session = createCssVarsSession({
      target: setupDocument(),
      prefixes: ['--color-']
    })

    expect(session.getVars().map((item) => item.name)).toEqual(['--color-base', '--color-primary'])
  })

  it('respeta include y exclude', () => {
    const session = createCssVarsSession({
      target: setupDocument(),
      include: ['space-md', 'text-muted'],
      exclude: ['--color-primary']
    })

    expect(session.getVars().map((item) => item.name)).toEqual([
      '--bg-page',
      '--color-base',
      '--text-muted'
    ])
  })

  it('descubre scopes adicionales sin dejar de incluir :root', () => {
    const session = createCssVarsSession({
      target: setupScopedDocument(),
      scopes: ['.landing', '[data-theme="dark"]', '.missing', '[']
    })

    expect(session.getVars().map((item) => `${item.scope}:${item.name}`)).toEqual([
      ':root:--bg-page',
      ':root:--color-base',
      ':root:--color-primary',
      ':root:--text-muted',
      '.landing:--color-hero-bg',
      '.landing:--color-primary',
      '[data-theme="dark"]:--color-primary'
    ])
    expect(session.getVar('--space-lg', { scope: '.landing' })).toBeUndefined()
  })

  it('escribe y resetea variables duplicadas en el scope correcto', () => {
    const target = setupScopedDocument()
    const session = createCssVarsSession({ target, scopes: ['.landing', '[data-theme="dark"]'] })
    const landing = target.querySelector<HTMLElement>('.landing')
    const dark = target.querySelector<HTMLElement>('[data-theme="dark"]')

    session.setVar('--color-primary', '#000000', { scope: '.landing' })

    expect(target.documentElement.style.getPropertyValue('--color-primary').trim()).toBe('rgb(0 0 0 / 1)')
    expect(landing?.style.getPropertyValue('--color-primary').trim()).toBe('#000000')
    expect(dark?.style.getPropertyValue('--color-primary').trim()).toBe('#f8fafc')

    session.resetVar('--color-primary', { scope: '.landing' })

    expect(landing?.style.getPropertyValue('--color-primary').trim()).toBe('#334455')
  })

  it('exporta variables agrupadas por scope cuando hay scopes adicionales', () => {
    const session = createCssVarsSession({ target: setupScopedDocument(), scopes: ['.landing'] })

    session.setVar('--color-hero-bg', '#000000', { scope: '.landing' })

    expect(session.exportCss()).toBe(`:root {\n  --bg-page: #121826;\n  --color-base: #ffffff;\n  --color-primary: rgb(0 0 0 / 1);\n  --text-muted: #7c89a0;\n}\n\n.landing {\n  --color-hero-bg: #000000;\n  --color-primary: #334455;\n}`)
    expect(session.exportJson()).toBe(`{\n  "version": 1,\n  "scopes": {\n    ":root": {\n      "--bg-page": "#121826",\n      "--color-base": "#ffffff",\n      "--color-primary": "rgb(0 0 0 / 1)",\n      "--text-muted": "#7c89a0"\n    },\n    ".landing": {\n      "--color-hero-bg": "#000000",\n      "--color-primary": "#334455"\n    }\n  }\n}`)
  })

  it('mantiene baseline inmutable y resetVar vuelve al baseline', () => {
    const session = createCssVarsSession({ target: setupDocument() })

    session.setVar('--color-base', '#000000')
    expect(session.getVar('--color-base')?.value).toBe('#000000')

    document.documentElement.style.setProperty('--color-base', '#123456')
    session.resetVar('--color-base')

    expect(session.getVar('--color-base')).toMatchObject({
      value: '#ffffff',
      baselineValue: '#ffffff'
    })
    expect(document.documentElement.style.getPropertyValue('--color-base').trim()).toBe('#ffffff')
  })

  it('setVar fuera de scope es no-op y allowRaw false rechaza valores inválidos', () => {
    const session = createCssVarsSession({ target: setupDocument() })

    session.setVar('--space-md', '24px')
    session.setVar('--color-base', 'url(javascript:alert(1))')

    expect(session.getVar('--space-md')).toBeUndefined()
    expect(session.getVar('--color-base')?.value).toBe('#ffffff')
  })

  it('allowRaw true permite raw pero no lo exporta', () => {
    const session = createCssVarsSession({
      target: setupDocument(),
      allowRaw: true
    })

    session.setVar('--color-base', 'oklch(62% 0.2 240)')

    expect(session.getVar('--color-base')).toMatchObject({
      value: 'oklch(62% 0.2 240)',
      exportable: false,
      editableAsColor: false
    })
    expect(session.exportCss()).not.toContain('oklch')
    expect(session.exportJson()).not.toContain('oklch')
  })

  it('rechaza colores funcionales inválidos como exportables', () => {
    const session = createCssVarsSession({ target: setupDocument() })

    session.setVar('--color-base', 'rgb(foo)')
    session.setVar('--color-primary', 'hsl(not-a-color)')

    expect(session.getVar('--color-base')?.value).toBe('#ffffff')
    expect(session.getVar('--color-primary')?.value).toBe('rgb(0 0 0 / 1)')
  })

  it('mantiene soporte para colores funcionales válidos', () => {
    const session = createCssVarsSession({ target: setupDocument() })

    session.setVar('--color-base', 'rgba(38, 38, 38, 1)')
    session.setVar('--color-primary', 'hsl(240 100% 50%)')

    expect(session.getVar('--color-base')?.value).toBe('rgba(38, 38, 38, 1)')
    expect(session.getVar('--color-primary')?.value).toBe('hsl(240 100% 50%)')
  })

  it('exporta CSS y JSON con orden estable y solo valores exportables', () => {
    const session = createCssVarsSession({ target: setupDocument(), allowRaw: true })

    session.setVar('--color-primary', '#111111')
    session.setVar('--color-base', 'var(--other)')

    expect(session.exportCss()).toBe(`:root {\n  --bg-page: #121826;\n  --color-primary: #111111;\n  --text-muted: #7c89a0;\n}`)
    expect(session.exportJson()).toBe(`{\n  "version": 1,\n  "vars": {\n    "--bg-page": "#121826",\n    "--color-primary": "#111111",\n    "--text-muted": "#7c89a0"\n  }\n}`)
  })

  it('destroy es idempotente y deja getters vacíos', () => {
    const session = createCssVarsSession({ target: setupDocument() })

    session.destroy()
    session.destroy()

    expect(session.getVars()).toEqual([])
    expect(session.getVar('--color-base')).toBeUndefined()
    expect(session.exportCss()).toBe('')
    expect(session.exportJson()).toBe('')
  })
})
