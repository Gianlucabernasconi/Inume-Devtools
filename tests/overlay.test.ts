import { beforeEach, describe, expect, it, vi } from 'vitest'

import { mountCssVarsDevtool } from '../src/browser'

function setupDocument(): void {
  document.body.replaceChildren()
  document.documentElement.style.cssText = ''
  document.documentElement.style.setProperty('--color-base', '#0f172a')
  document.documentElement.style.setProperty('--color-primary', '#8b5cf6')
  document.documentElement.style.setProperty('--color-surface', '#111827')
  document.documentElement.style.setProperty('--color-text-primary', '#f8fafc')
}

function getOverlayParts() {
  const host = document.querySelector('[data-inume-css-vars-devtool-root="true"]') as HTMLDivElement | null
  expect(host).not.toBeNull()
  const shadowRoot = host?.shadowRoot
  expect(shadowRoot).not.toBeNull()

  return {
    host,
    shadowRoot: shadowRoot as ShadowRoot
  }
}

describe('browser overlay', () => {
  beforeEach(() => {
    setupDocument()
    vi.restoreAllMocks()
  })

  it('monta boton flotante y materializa el panel lazy al abrirse', () => {
    const handle = mountCssVarsDevtool({ productionGuard: 'off' })

    const { shadowRoot } = getOverlayParts()
    expect(shadowRoot.querySelector('.toggle-button')).not.toBeNull()
    expect(shadowRoot.querySelector('.panel')).toBeNull()

    handle.show()

    const panel = shadowRoot.querySelector('.panel') as HTMLDivElement | null
    expect(panel).not.toBeNull()
    expect(panel?.hidden).toBe(false)
  })

  it('selecciona la primera variable visible y filtra la lista', () => {
    const handle = mountCssVarsDevtool({ productionGuard: 'off', defaultOpen: true })
    void handle

    const { shadowRoot } = getOverlayParts()
    const selectedName = shadowRoot.querySelector('.selected-name') as HTMLParagraphElement
    expect(selectedName.textContent).toBe('--color-base')

    const searchInput = shadowRoot.querySelector('.search input') as HTMLInputElement
    searchInput.value = 'text'
    searchInput.dispatchEvent(new Event('input', { bubbles: true }))

    const rows = Array.from(shadowRoot.querySelectorAll('.row-button .row-name')).map((element) => element.textContent)
    expect(rows).toEqual(['--color-text-primary'])
    expect(selectedName.textContent).toBe('--color-text-primary')
  })

  it('edita la variable activa y permite resetearla', () => {
    const handle = mountCssVarsDevtool({ productionGuard: 'off', defaultOpen: true })
    void handle

    const { shadowRoot } = getOverlayParts()
    const colorInput = shadowRoot.querySelector('.editor input[type="color"]') as HTMLInputElement
    colorInput.value = '#112233'
    colorInput.dispatchEvent(new Event('input', { bubbles: true }))

    expect(document.documentElement.style.getPropertyValue('--color-base').trim()).toBe('#112233')

    const resetButton = Array.from(shadowRoot.querySelectorAll('.ghost-button')).find((button) => button.textContent === 'Reset') as HTMLButtonElement
    resetButton.click()

    expect(document.documentElement.style.getPropertyValue('--color-base').trim()).toBe('#0f172a')
  })

  it('resetea todas las variables y copia CSS sin romper el overlay', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(window.navigator, 'clipboard', {
      configurable: true,
      value: { writeText }
    })

    const handle = mountCssVarsDevtool({ productionGuard: 'off', defaultOpen: true })
    void handle

    const { shadowRoot } = getOverlayParts()
    const colorInput = shadowRoot.querySelector('.editor input[type="color"]') as HTMLInputElement
    colorInput.value = '#445566'
    colorInput.dispatchEvent(new Event('input', { bubbles: true }))

    const resetAllButton = Array.from(shadowRoot.querySelectorAll('.ghost-button')).find((button) => button.textContent === 'Reset all') as HTMLButtonElement
    resetAllButton.click()
    expect(document.documentElement.style.getPropertyValue('--color-base').trim()).toBe('#0f172a')

    const copyCssButton = shadowRoot.querySelector('.primary-button') as HTMLButtonElement
    copyCssButton.click()

    await Promise.resolve()
    expect(writeText).toHaveBeenCalledTimes(1)
    expect(writeText.mock.calls[0]?.[0]).toContain('--color-base')
  })

  it('destroy desmonta el overlay del documento', () => {
    const handle = mountCssVarsDevtool({ productionGuard: 'off', defaultOpen: true })

    expect(document.querySelector('[data-inume-css-vars-devtool-root="true"]')).not.toBeNull()
    handle.destroy()
    expect(document.querySelector('[data-inume-css-vars-devtool-root="true"]')).toBeNull()
  })
})
