import { describe, expect, it } from 'vitest'

import { createCssVarsSession } from '../src/index'

function setupDocument(): Document {
  document.documentElement.innerHTML = ''
  document.documentElement.style.cssText = ''
  document.documentElement.style.setProperty('--color-base', '#ffffff')
  document.documentElement.style.setProperty('--color-primary', 'rgb(0 0 0 / 1)')
  document.documentElement.style.setProperty('--space-md', '16px')
  return document
}

describe('createCssVarsSession', () => {
  it('descubre solo --color-* por defecto', () => {
    const session = createCssVarsSession({ target: setupDocument() })

    expect(session.getVars().map((item) => item.name)).toEqual([
      '--color-base',
      '--color-primary'
    ])
  })

  it('prefixes reemplaza el default', () => {
    const session = createCssVarsSession({
      target: setupDocument(),
      prefixes: ['--space-']
    })

    expect(session.getVars().map((item) => item.name)).toEqual(['--space-md'])
  })

  it('respeta include y exclude', () => {
    const session = createCssVarsSession({
      target: setupDocument(),
      include: ['space-md'],
      exclude: ['--color-primary']
    })

    expect(session.getVars().map((item) => item.name)).toEqual([
      '--color-base',
      '--space-md'
    ])
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

  it('exporta CSS y JSON con orden estable y solo valores exportables', () => {
    const session = createCssVarsSession({ target: setupDocument(), allowRaw: true })

    session.setVar('--color-primary', '#111111')
    session.setVar('--color-base', 'var(--other)')

    expect(session.exportCss()).toBe(`:root {\n  --color-primary: #111111;\n}`)
    expect(session.exportJson()).toBe(`{\n  "version": 1,\n  "vars": {\n    "--color-primary": "#111111"\n  }\n}`)
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
