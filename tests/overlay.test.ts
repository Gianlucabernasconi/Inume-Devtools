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

  it('permite mover el boton flotante por la pantalla', () => {
    mountCssVarsDevtool({ productionGuard: 'off' })

    const { shadowRoot } = getOverlayParts()
    const toggleButton = shadowRoot.querySelector('.toggle-button') as HTMLButtonElement

    Object.defineProperty(toggleButton, 'getBoundingClientRect', {
      configurable: true,
      value: () => ({ left: 700, top: 700, width: 140, height: 52, right: 840, bottom: 752 })
    })

    toggleButton.dispatchEvent(new PointerEvent('pointerdown', { clientX: 710, clientY: 710, bubbles: true }))
    window.dispatchEvent(new PointerEvent('pointermove', { clientX: 320, clientY: 280, bubbles: true }))
    window.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }))

    expect(toggleButton.style.left).not.toBe('')
    expect(toggleButton.style.top).not.toBe('')
    expect(toggleButton.style.right).toBe('auto')
    expect(toggleButton.style.bottom).toBe('auto')
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
    const colorInput = shadowRoot.querySelector('.editor .editor-text-input') as HTMLInputElement
    colorInput.value = '#112233'
    colorInput.dispatchEvent(new Event('change', { bubbles: true }))

    const pickerArea = shadowRoot.querySelector('.picker-area') as HTMLDivElement
    expect(pickerArea.hidden).toBe(false)

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
    const colorInput = shadowRoot.querySelector('.editor .editor-text-input') as HTMLInputElement
    colorInput.value = '#445566'
    colorInput.dispatchEvent(new Event('change', { bubbles: true }))

    const resetAllButton = Array.from(shadowRoot.querySelectorAll('.ghost-button')).find((button) => button.textContent === 'Reset all') as HTMLButtonElement
    resetAllButton.click()
    expect(document.documentElement.style.getPropertyValue('--color-base').trim()).toBe('#0f172a')

    const copyCssButton = shadowRoot.querySelector('.primary-button') as HTMLButtonElement
    copyCssButton.click()

    await Promise.resolve()
    expect(writeText).toHaveBeenCalledTimes(1)
    expect(writeText.mock.calls[0]?.[0]).toContain('--color-base')
  })

  it('copy json y downloads solo ocurren bajo click explicito', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    const createObjectUrl = vi.fn().mockReturnValue('blob:mock')
    const revokeObjectUrl = vi.fn()
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})

    Object.defineProperty(window.navigator, 'clipboard', {
      configurable: true,
      value: { writeText }
    })

    Object.defineProperty(window, 'URL', {
      configurable: true,
      value: {
        createObjectURL: createObjectUrl,
        revokeObjectURL: revokeObjectUrl
      }
    })

    mountCssVarsDevtool({ productionGuard: 'off', defaultOpen: true, title: 'Unsafe / Title ???' })

    expect(writeText).not.toHaveBeenCalled()
    expect(createObjectUrl).not.toHaveBeenCalled()
    expect(clickSpy).not.toHaveBeenCalled()

    const { shadowRoot } = getOverlayParts()
    const menuButton = shadowRoot.querySelector('.menu-button') as HTMLButtonElement
    menuButton.click()

    const actionButtons = Array.from(shadowRoot.querySelectorAll('.action-menu .ghost-button')) as HTMLButtonElement[]
    const copyJsonButton = actionButtons.find((button) => button.textContent === 'Copy JSON') as HTMLButtonElement
    const downloadCssButton = actionButtons.find((button) => button.textContent === 'Download CSS') as HTMLButtonElement
    const downloadJsonButton = actionButtons.find((button) => button.textContent === 'Download JSON') as HTMLButtonElement

    copyJsonButton.click()
    await Promise.resolve()
    expect(writeText).toHaveBeenCalledTimes(1)
    expect(writeText.mock.calls[0]?.[0]).toContain('"version": 1')

    menuButton.click()
    downloadCssButton.click()
    expect(createObjectUrl).toHaveBeenCalledTimes(1)
    expect(clickSpy).toHaveBeenCalledTimes(1)

    const cssAnchor = document.body.querySelector('a[download="unsafe-title.css"]')
    expect(cssAnchor).toBeNull()

    menuButton.click()
    downloadJsonButton.click()
    expect(createObjectUrl).toHaveBeenCalledTimes(2)
    expect(clickSpy).toHaveBeenCalledTimes(2)
  })

  it('destroy desmonta el overlay del documento', () => {
    const handle = mountCssVarsDevtool({ productionGuard: 'off', defaultOpen: true })

    expect(document.querySelector('[data-inume-css-vars-devtool-root="true"]')).not.toBeNull()
    handle.destroy()
    expect(document.querySelector('[data-inume-css-vars-devtool-root="true"]')).toBeNull()
  })

  it('persiste cambios solo en commit valido y puede limpiar persisted state', async () => {
    window.localStorage.clear()

    const handle = mountCssVarsDevtool({
      productionGuard: 'off',
      defaultOpen: true,
      storage: { kind: 'local', key: 'overlay-test' }
    })

    const { shadowRoot } = getOverlayParts()
    const colorInput = shadowRoot.querySelector('.editor .editor-text-input') as HTMLInputElement
    colorInput.value = '#223344'

    expect(window.localStorage.getItem('overlay-test')).toBeNull()

    colorInput.dispatchEvent(new Event('change', { bubbles: true }))
    await waitForStorageFlush()

    expect(window.localStorage.getItem('overlay-test')).toContain('#223344')

    handle.clearPersisted()
    expect(window.localStorage.getItem('overlay-test')).toBeNull()

    handle.hide()
    await waitForStorageFlush()
    expect(window.localStorage.getItem('overlay-test')).toBeNull()

    handle.show()
    colorInput.value = '#334455'
    colorInput.dispatchEvent(new Event('change', { bubbles: true }))
    await waitForStorageFlush()

    expect(window.localStorage.getItem('overlay-test')).toContain('#334455')
  })

  it('ya no usa input color nativo en el overlay', () => {
    mountCssVarsDevtool({ productionGuard: 'off', defaultOpen: true })

    const { shadowRoot } = getOverlayParts()
    expect(shadowRoot.querySelector('input[type="color"]')).toBeNull()
    expect(shadowRoot.querySelector('.picker-area')).not.toBeNull()
    expect(shadowRoot.querySelector('.picker-hue')).not.toBeNull()
  })

  it('ignora storage corrupta y restaura estado valido cuando existe', () => {
    window.localStorage.setItem('corrupt-storage', '{bad json')

    const corruptHandle = mountCssVarsDevtool({
      productionGuard: 'off',
      defaultOpen: true,
      storage: { kind: 'local', key: 'corrupt-storage' }
    })

    expect(document.documentElement.style.getPropertyValue('--color-base').trim()).toBe('#0f172a')
    corruptHandle.destroy()

    window.localStorage.setItem(
      'valid-storage',
      JSON.stringify({
        version: 1,
        vars: { '--color-base': '#102030' },
        panelPosition: { left: 24, top: 36 }
      })
    )

    const validHandle = mountCssVarsDevtool({
      productionGuard: 'off',
      defaultOpen: true,
      storage: { kind: 'local', key: 'valid-storage' }
    })
    void validHandle

    expect(document.documentElement.style.getPropertyValue('--color-base').trim()).toBe('#102030')
    const { shadowRoot } = getOverlayParts()
    const panel = shadowRoot.querySelector('.panel') as HTMLDivElement
    expect(panel.style.left).toBe('24px')
    expect(panel.style.top).toBe('36px')
  })

  it('exige storage.key explicita con match y para mounts multiples implicitos', () => {
    expect(() => {
      mountCssVarsDevtool({
        productionGuard: 'off',
        storage: { kind: 'local' },
        match: (name) => name.includes('base')
      })
    }).toThrow('storage.key explícita')

    const first = mountCssVarsDevtool({
      productionGuard: 'off',
      storage: { kind: 'local' }
    })

    expect(() => {
      mountCssVarsDevtool({
        productionGuard: 'off',
        storage: { kind: 'local' }
      })
    }).toThrow('múltiples mounts persistentes')

    first.destroy()
  })
})

async function waitForStorageFlush(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 60))
}
