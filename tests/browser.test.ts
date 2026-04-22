import { beforeEach, describe, expect, it, vi } from 'vitest'

import { createCssVarsSession } from '../src'
import { mountCssVarsDevtool } from '../src/browser'
import { resolveLocale, resolveMessages } from '../src/browser/i18n'
import * as productionGuard from '../src/browser/production-guard'

function setupDocument(): Document {
  document.body.replaceChildren()
  document.documentElement.style.cssText = ''
  document.documentElement.style.setProperty('--color-base', '#ffffff')
  document.documentElement.style.setProperty('--color-primary', '#111111')
  return document
}

describe('productionGuard', () => {
  beforeEach(() => {
    setupDocument()
    window.history.replaceState({}, '', '/test')
    vi.restoreAllMocks()
  })

  it('strict bloquea hosts no locales devolviendo handle inert', () => {
    vi.spyOn(productionGuard, 'getProductionGuardDecision').mockReturnValue({
      blocked: true,
      shouldWarn: false
    })

    const handle = mountCssVarsDevtool({ productionGuard: 'strict' })

    expect(handle).toBeDefined()
    expect(() => {
      handle.show()
      handle.hide()
      handle.toggle()
      handle.clearPersisted()
      handle.destroy()
      handle.destroy()
    }).not.toThrow()
  })

  it('warn monta y loguea warning', () => {
    vi.spyOn(productionGuard, 'getProductionGuardDecision').mockReturnValue({
      blocked: false,
      shouldWarn: true,
      warningMessage:
        '[css-vars-devtools] productionGuard activo fuera de loopback local. Mantener el import dinamico solo en desarrollo sigue siendo obligatorio.'
    })
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const handle = mountCssVarsDevtool({ productionGuard: 'warn' })

    expect(handle).toBeDefined()
    expect(warnSpy).toHaveBeenCalledTimes(1)
    expect(warnSpy.mock.calls[0]?.[0]).toContain('productionGuard')
  })

  it('off no bloquea ni loguea warning', () => {
    vi.spyOn(productionGuard, 'getProductionGuardDecision').mockReturnValue({
      blocked: false,
      shouldWarn: false
    })
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const handle = mountCssVarsDevtool({ productionGuard: 'off' })

    expect(handle).toBeDefined()
    expect(warnSpy).not.toHaveBeenCalled()
  })

  it('si una sesion externa se destruye, el handle queda inert sin throw', () => {
    const session = createCssVarsSession({ target: setupDocument() })
    const handle = mountCssVarsDevtool({ session, productionGuard: 'off' })

    session.destroy()

    expect(() => {
      handle.show()
      handle.hide()
      handle.toggle()
      handle.clearPersisted()
      handle.destroy()
    }).not.toThrow()
  })

  it('evalua las decisiones de strict, warn y off correctamente', () => {
    const localDecision = productionGuard.getProductionGuardDecision('strict', createWindowLike('http://localhost:3000/test'))
    expect(localDecision).toEqual({ blocked: false, shouldWarn: false })

    expect(productionGuard.getProductionGuardDecision('strict', createWindowLike('https://example.com/app'))).toEqual({
      blocked: true,
      shouldWarn: false
    })

    expect(productionGuard.getProductionGuardDecision('warn', createWindowLike('https://example.com/app'))).toEqual({
      blocked: false,
      shouldWarn: true,
      warningMessage:
        '[css-vars-devtools] productionGuard activo fuera de loopback local. Mantener el import dinamico solo en desarrollo sigue siendo obligatorio.'
    })

    expect(productionGuard.getProductionGuardDecision('off', createWindowLike('https://example.com/app'))).toEqual({
      blocked: false,
      shouldWarn: false
    })
  })

  it('locale auto resuelve por primary language y fallback a en', () => {
    expect(resolveLocale('auto', { language: 'es-CL' } as Navigator)).toBe('es')
    expect(resolveLocale('auto', { language: 'pt-BR' } as Navigator)).toBe('en')
    expect(resolveLocale(undefined, undefined)).toBe('en')
  })

  it('messages custom pisan al diccionario del locale', () => {
    expect(resolveMessages('es', undefined).searchPlaceholder).toBe('Buscar variable')
    expect(resolveMessages('en', undefined).searchPlaceholder).toBe('Search variable')

    expect(
      resolveMessages(
        'es',
        {
          searchPlaceholder: 'Filtro custom',
          copyCss: 'Copiar bloque'
        },
        { language: 'en-US' } as Navigator
      )
    ).toMatchObject({
      searchPlaceholder: 'Filtro custom',
      copyCss: 'Copiar bloque',
      resetAll: 'Resetear todo'
    })
  })
})

function createWindowLike(url: string): Window {
  return {
    location: new URL(url) as unknown as Location
  } as unknown as Window
}
