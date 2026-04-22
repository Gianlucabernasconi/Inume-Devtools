import type { CssVarItem, CssVarsMessages, CssVarsSession } from '../shared/types'
import { triggerDownload } from './download'
import { getOverlayStyles } from './styles'
import type { PersistedPanelPosition } from './storage-schema'

interface OverlayOptions {
  session: CssVarsSession
  title?: string
  messages: CssVarsMessages
  defaultOpen?: boolean
  storageEnabled?: boolean
  initialPanelPosition?: PersistedPanelPosition
  onCommit?: (reason: 'change' | 'reset' | 'resetAll' | 'hide' | 'copyCss', state: { panelPosition?: PersistedPanelPosition }) => void
  onClearPersisted?: () => void
}

interface OverlayController {
  show(): void
  hide(): void
  toggle(): void
  getPanelPosition(): PersistedPanelPosition | undefined
  destroy(): void
}

export function createOverlay(options: OverlayOptions): OverlayController {
  const { session } = options
  const currentWindow = window
  const currentDocument = currentWindow.document
  const host = currentDocument.createElement('div')
  host.dataset.inumeCssVarsDevtoolRoot = 'true'

  const shadowRoot = host.attachShadow({ mode: 'open' })
  const style = currentDocument.createElement('style')
  style.textContent = getOverlayStyles()

  const root = currentDocument.createElement('div')
  root.className = 'overlay-root'

  const toggleButton = currentDocument.createElement('button')
  toggleButton.type = 'button'
  toggleButton.className = 'toggle-button'

  const toggleBadge = currentDocument.createElement('span')
  toggleBadge.className = 'toggle-badge'
  const toggleText = currentDocument.createElement('span')

  toggleButton.append(toggleBadge, toggleText)
  root.append(toggleButton)
  shadowRoot.append(style, root)
  currentDocument.body.append(host)

  const messages = options.messages
  const title = options.title?.trim() || messages.title

  let destroyed = false
  let visible = false
  let search = ''
  let selectedName: string | undefined
  let statusText = 'Ready.'
  let panelPosition: PersistedPanelPosition | undefined = options.initialPanelPosition
  let dragState:
    | {
        offsetX: number
        offsetY: number
      }
    | undefined
  let togglePosition: PersistedPanelPosition | undefined
  let toggleDragState:
    | {
        offsetX: number
        offsetY: number
        moved: boolean
      }
    | undefined

  let panel: HTMLDivElement | undefined
  let selectedNameElement: HTMLParagraphElement | undefined
  let selectedValueElement: HTMLParagraphElement | undefined
  let swatchElement: HTMLDivElement | undefined
  let colorInput: HTMLInputElement | undefined
  let pickerAreaElement: HTMLDivElement | undefined
  let pickerThumbElement: HTMLDivElement | undefined
  let hueInput: HTMLInputElement | undefined
  let resetButton: HTMLButtonElement | undefined
  let resetAllButton: HTMLButtonElement | undefined
  let searchInput: HTMLInputElement | undefined
  let listElement: HTMLDivElement | undefined
  let emptyStateElement: HTMLDivElement | undefined
  let emptyCopyElement: HTMLParagraphElement | undefined
  let statusElement: HTMLParagraphElement | undefined
  let copyCssButton: HTMLButtonElement | undefined
  let copyJsonButton: HTMLButtonElement | undefined
  let clearPersistedButton: HTMLButtonElement | undefined
  let downloadCssButton: HTMLButtonElement | undefined
  let downloadJsonButton: HTMLButtonElement | undefined
  let menuButton: HTMLButtonElement | undefined
  let actionMenu: HTMLDivElement | undefined
  let menuOpen = false
  let pickerState:
    | {
        h: number
        s: number
        l: number
      }
    | undefined

  const stopDrag = (): void => {
    dragState = undefined
    currentWindow.removeEventListener('pointermove', handlePointerMove)
    currentWindow.removeEventListener('pointerup', stopDrag)
  }

  const stopToggleDrag = (): void => {
    currentWindow.removeEventListener('pointermove', handleTogglePointerMove)
    currentWindow.removeEventListener('pointerup', stopToggleDrag)

    if (!toggleDragState) {
      return
    }

    currentWindow.setTimeout(() => {
      toggleDragState = undefined
    }, 0)
  }

  const handlePointerMove = (event: PointerEvent): void => {
    if (!dragState || !panel) {
      return
    }

    const panelRect = panel.getBoundingClientRect()
    panelPosition = {
      left: clamp(event.clientX - dragState.offsetX, 8, currentWindow.innerWidth - panelRect.width - 8),
      top: clamp(event.clientY - dragState.offsetY, 8, currentWindow.innerHeight - panelRect.height - 8)
    }

    applyPanelPosition()
    statusText = 'Panel moved.'
    updateFooter()
  }

  const handleTogglePointerMove = (event: PointerEvent): void => {
    if (!toggleDragState) {
      return
    }

    const toggleRect = toggleButton.getBoundingClientRect()
    togglePosition = {
      left: clamp(event.clientX - toggleDragState.offsetX, 8, currentWindow.innerWidth - toggleRect.width - 8),
      top: clamp(event.clientY - toggleDragState.offsetY, 8, currentWindow.innerHeight - toggleRect.height - 8)
    }

    toggleDragState.moved = true
    applyTogglePosition()
  }

  const handleResize = (): void => {
    if (panel && panelPosition) {
      const panelRect = panel.getBoundingClientRect()
      panelPosition = {
        left: clamp(panelPosition.left, 8, currentWindow.innerWidth - panelRect.width - 8),
        top: clamp(panelPosition.top, 8, currentWindow.innerHeight - panelRect.height - 8)
      }

      applyPanelPosition()
      statusText = 'Panel re-fitted to viewport.'
      updateFooter()
    }

    applyTogglePosition()
  }

  function isSessionInert(): boolean {
    return session.getVars().length === 0 && session.exportCss() === '' && session.exportJson() === ''
  }

  function getVisibleItems(): CssVarItem[] {
    const query = search.trim().toLowerCase()
    const items = session.getVars()

    if (!query) {
      return items
    }

    return items.filter((item) => item.name.toLowerCase().includes(query))
  }

  function ensureSelection(items: CssVarItem[]): void {
    if (items.length === 0) {
      selectedName = undefined
      return
    }

    if (selectedName && items.some((item) => item.name === selectedName)) {
      return
    }

    selectedName = items[0]?.name
  }

  function getSelectedItem(items: CssVarItem[]): CssVarItem | undefined {
    if (!selectedName) {
      return undefined
    }

    return items.find((item) => item.name === selectedName)
  }

  function toHexColor(value: string): string | undefined {
    const directHex = value.trim()
    if (/^#[\da-f]{6}$/i.test(directHex)) {
      return directHex.toLowerCase()
    }

    const sample = currentDocument.createElement('span')
    sample.style.color = ''
    sample.style.color = value

    if (!sample.style.color) {
      return undefined
    }

    currentDocument.body.append(sample)
    const computed = currentWindow.getComputedStyle(sample).color
    sample.remove()

    const match = computed.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/i)
    if (!match) {
      return undefined
    }

    return `#${match
      .slice(1, 4)
      .map((channel) => Number(channel).toString(16).padStart(2, '0'))
      .join('')}`
  }

  function hexToHsl(hex: string): { h: number; s: number; l: number } {
    const red = Number.parseInt(hex.slice(1, 3), 16) / 255
    const green = Number.parseInt(hex.slice(3, 5), 16) / 255
    const blue = Number.parseInt(hex.slice(5, 7), 16) / 255
    const max = Math.max(red, green, blue)
    const min = Math.min(red, green, blue)
    const delta = max - min
    let hue = 0

    if (delta !== 0) {
      if (max === red) {
        hue = ((green - blue) / delta) % 6
      } else if (max === green) {
        hue = (blue - red) / delta + 2
      } else {
        hue = (red - green) / delta + 4
      }
    }

    hue = Math.round(hue * 60)
    if (hue < 0) {
      hue += 360
    }

    const lightness = (max + min) / 2
    const saturation = delta === 0 ? 0 : delta / (1 - Math.abs(2 * lightness - 1))

    return {
      h: hue,
      s: Math.round(saturation * 100),
      l: Math.round(lightness * 100)
    }
  }

  function hslToHex(hue: number, saturation: number, lightness: number): string {
    const s = saturation / 100
    const l = lightness / 100
    const chroma = (1 - Math.abs(2 * l - 1)) * s
    const segment = hue / 60
    const x = chroma * (1 - Math.abs((segment % 2) - 1))
    let red = 0
    let green = 0
    let blue = 0

    if (segment >= 0 && segment < 1) {
      red = chroma
      green = x
    } else if (segment < 2) {
      red = x
      green = chroma
    } else if (segment < 3) {
      green = chroma
      blue = x
    } else if (segment < 4) {
      green = x
      blue = chroma
    } else if (segment < 5) {
      red = x
      blue = chroma
    } else {
      red = chroma
      blue = x
    }

    const match = l - chroma / 2
    return `#${[red, green, blue]
      .map((channel) => Math.round((channel + match) * 255).toString(16).padStart(2, '0'))
      .join('')}`
  }

  function updatePickerUi(): void {
    if (!pickerAreaElement || !pickerThumbElement || !hueInput || !colorInput || !pickerState) {
      return
    }

    pickerAreaElement.style.background = `linear-gradient(to top, black, transparent), linear-gradient(to right, white, hsl(${pickerState.h} 100% 50%))`
    pickerThumbElement.style.left = `${pickerState.s}%`
    pickerThumbElement.style.top = `${100 - pickerState.l}%`
    hueInput.value = String(Math.round(pickerState.h))
  }

  function commitPickerColor(): void {
    if (!selectedName || !colorInput || !pickerState) {
      return
    }

    const nextHex = hslToHex(pickerState.h, pickerState.s, pickerState.l)
    colorInput.value = nextHex
    session.setVar(selectedName, nextHex)
    statusText = `Updated ${selectedName}.`
    render()
  }

  function applyPanelPosition(): void {
    if (!panel) {
      return
    }

    if (!panelPosition) {
      panel.style.left = ''
      panel.style.top = ''
      panel.style.right = '16px'
      return
    }

    panel.style.left = `${panelPosition.left}px`
    panel.style.top = `${panelPosition.top}px`
    panel.style.right = 'auto'
  }

  function applyTogglePosition(): void {
    const toggleRect = toggleButton.getBoundingClientRect()

    if (!togglePosition) {
      toggleButton.style.left = ''
      toggleButton.style.top = ''
      toggleButton.style.right = '16px'
      toggleButton.style.bottom = '16px'
      return
    }

    togglePosition = {
      left: clamp(togglePosition.left, 8, currentWindow.innerWidth - toggleRect.width - 8),
      top: clamp(togglePosition.top, 8, currentWindow.innerHeight - toggleRect.height - 8)
    }

    toggleButton.style.left = `${togglePosition.left}px`
    toggleButton.style.top = `${togglePosition.top}px`
    toggleButton.style.right = 'auto'
    toggleButton.style.bottom = 'auto'
  }

  function updateToggleButton(): void {
    toggleButton.setAttribute('aria-expanded', String(visible))
    toggleBadge.textContent = messages.devOnly
    toggleText.textContent = visible ? messages.close : messages.open
  }

  function updateFooter(): void {
    if (!statusElement) {
      return
    }

    statusElement.textContent = statusText

    if (menuButton) {
      menuButton.setAttribute('aria-expanded', String(menuOpen))
    }

    if (actionMenu) {
      actionMenu.hidden = !menuOpen
    }
  }

  function updateEditor(selectedItem: CssVarItem | undefined): void {
    if (!selectedNameElement || !selectedValueElement || !swatchElement || !colorInput || !resetButton || !resetAllButton || !pickerAreaElement || !pickerThumbElement || !hueInput) {
      return
    }

    if (!selectedItem) {
      selectedNameElement.textContent = 'No selection'
      selectedValueElement.textContent = search ? messages.noResults : 'No variables detected.'
      swatchElement.style.background = '#0f172a'
      colorInput.value = '#000000'
      colorInput.disabled = true
      pickerAreaElement.hidden = true
      hueInput.disabled = true
      pickerState = undefined
      resetButton.disabled = true
      resetAllButton.disabled = session.getVars().length === 0
      return
    }

    const nextHex = toHexColor(selectedItem.value)
    selectedNameElement.textContent = selectedItem.name
    selectedValueElement.textContent = selectedItem.value
    swatchElement.style.background = selectedItem.value
    colorInput.value = nextHex ?? selectedItem.value
    colorInput.disabled = !selectedItem.editableAsColor || !nextHex
    pickerAreaElement.hidden = !selectedItem.editableAsColor || !nextHex
    hueInput.disabled = !selectedItem.editableAsColor || !nextHex

    if (nextHex) {
      pickerState = hexToHsl(nextHex)
      updatePickerUi()
    }

    resetButton.disabled = false
    resetAllButton.disabled = session.getVars().length === 0
  }

  function updateList(items: CssVarItem[]): void {
    if (!listElement || !emptyStateElement || !emptyCopyElement) {
      return
    }

    listElement.replaceChildren()

    if (items.length === 0) {
      emptyCopyElement.textContent = messages.noResults
      emptyStateElement.hidden = false
      return
    }

    emptyStateElement.hidden = true

    for (const item of items) {
      const row = currentDocument.createElement('button')
      row.type = 'button'
      row.className = 'row-button'
      if (item.name === selectedName) {
        row.classList.add('is-selected')
      }

      const swatch = currentDocument.createElement('span')
      swatch.className = 'row-swatch'
      swatch.style.background = item.value

      const name = currentDocument.createElement('span')
      name.className = 'row-name'
      name.textContent = item.name

      row.append(swatch, name)
      row.addEventListener('click', () => {
        if (destroyed || isSessionInert()) {
          return
        }

        selectedName = item.name
        statusText = `Selected ${item.name}.`
        render()
      })

      listElement.append(row)
    }
  }

  function render(): void {
    if (destroyed || !panel) {
      updateToggleButton()
      return
    }

    const items = getVisibleItems()
    ensureSelection(items)
    const selectedItem = getSelectedItem(items)

    panel.hidden = !visible
    updateToggleButton()
    updateEditor(selectedItem)
    updateList(items)
    updateFooter()
    applyPanelPosition()

    if (searchInput && searchInput.value !== search) {
      searchInput.value = search
    }
  }

  async function handleCopyCss(): Promise<void> {
    if (destroyed || isSessionInert()) {
      return
    }

    const clipboard = currentWindow.navigator.clipboard
    if (!clipboard?.writeText) {
      statusText = 'Clipboard API is not available.'
      updateFooter()
      return
    }

    try {
      await clipboard.writeText(session.exportCss())
      statusText = 'CSS copied to clipboard.'
      options.onCommit?.('copyCss', { panelPosition })
    } catch {
      statusText = 'Clipboard copy failed.'
    }

    updateFooter()
  }

  async function handleCopyJson(): Promise<void> {
    if (destroyed || isSessionInert()) {
      return
    }

    const clipboard = currentWindow.navigator.clipboard
    if (!clipboard?.writeText) {
      statusText = 'Clipboard API is not available.'
      updateFooter()
      return
    }

    try {
      await clipboard.writeText(session.exportJson())
      statusText = 'JSON copied to clipboard.'
    } catch {
      statusText = 'Clipboard copy failed.'
    }

    closeActionMenu()
    updateFooter()
  }

  function handleDownload(extension: 'css' | 'json'): void {
    if (destroyed || isSessionInert()) {
      return
    }

    const content = extension === 'css' ? session.exportCss() : session.exportJson()

    triggerDownload({
      content,
      baseName: title,
      extension,
      mimeType: extension === 'css' ? 'text/css;charset=utf-8' : 'application/json;charset=utf-8',
      currentWindow,
      currentDocument
    })

    statusText = extension === 'css' ? 'CSS download started.' : 'JSON download started.'
    closeActionMenu()
    updateFooter()
  }

  function closeActionMenu(): void {
    menuOpen = false
    updateFooter()
  }

  function toggleActionMenu(): void {
    menuOpen = !menuOpen
    updateFooter()
  }

  function ensurePanel(): void {
    if (panel) {
      return
    }

    panel = currentDocument.createElement('div')
    panel.className = 'panel'
    panel.hidden = true

    const header = currentDocument.createElement('div')
    header.className = 'header'
    header.addEventListener('pointerdown', (event) => {
      if (destroyed || (event.target instanceof Element && event.target.closest('[data-no-drag]'))) {
        return
      }

      const rect = panel?.getBoundingClientRect()
      if (!rect) {
        return
      }

      if (!panelPosition) {
        panelPosition = { left: rect.left, top: rect.top }
      }

      dragState = {
        offsetX: event.clientX - rect.left,
        offsetY: event.clientY - rect.top
      }

      currentWindow.addEventListener('pointermove', handlePointerMove)
      currentWindow.addEventListener('pointerup', stopDrag)
    })

    const headerCopy = currentDocument.createElement('div')
    headerCopy.className = 'header-copy'

    const titleElement = currentDocument.createElement('p')
    titleElement.className = 'title'
    titleElement.textContent = title

    const headerMeta = currentDocument.createElement('div')
    headerMeta.className = 'header-meta'

    const devBadge = currentDocument.createElement('span')
    devBadge.className = 'dev-badge'
    devBadge.textContent = messages.devOnly

    headerMeta.append(devBadge)
    headerCopy.append(titleElement, headerMeta)

    const closeButton = currentDocument.createElement('button')
    closeButton.type = 'button'
    closeButton.className = 'close-button'
    closeButton.dataset.noDrag = 'true'
    closeButton.setAttribute('aria-label', messages.close)
    closeButton.textContent = '×'
    closeButton.addEventListener('click', () => hide())

    header.append(headerCopy, closeButton)

    const editor = currentDocument.createElement('div')
    editor.className = 'editor'

    const editorTop = currentDocument.createElement('div')
    editorTop.className = 'editor-top'

    const editorCopy = currentDocument.createElement('div')
    selectedNameElement = currentDocument.createElement('p')
    selectedNameElement.className = 'selected-name'
    selectedValueElement = currentDocument.createElement('p')
    selectedValueElement.className = 'selected-value'
    editorCopy.append(selectedNameElement, selectedValueElement)

    swatchElement = currentDocument.createElement('div')
    swatchElement.className = 'swatch'

    editorTop.append(editorCopy, swatchElement)

    const editorActions = currentDocument.createElement('div')
    editorActions.className = 'editor-actions'

    const editorControls = currentDocument.createElement('div')
    editorControls.className = 'editor-controls'

    colorInput = currentDocument.createElement('input')
    colorInput.type = 'text'
    colorInput.className = 'editor-text-input'
    colorInput.spellcheck = false
    colorInput.autocomplete = 'off'
    colorInput.autocapitalize = 'off'
    colorInput.addEventListener('change', () => {
      if (!selectedName) {
        return
      }

      const nextHex = colorInput?.value.trim().toLowerCase() ?? ''
      if (!/^#[\da-f]{6}$/i.test(nextHex)) {
        render()
        return
      }

      pickerState = hexToHsl(nextHex)
      session.setVar(selectedName, nextHex)
      statusText = `Updated ${selectedName}.`
      render()
      options.onCommit?.('change', { panelPosition })
    })
    colorInput.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter') {
        return
      }

      event.preventDefault()
      colorInput?.dispatchEvent(new Event('change', { bubbles: true }))
      colorInput?.blur()
    })
    colorInput.addEventListener('blur', () => {
      options.onCommit?.('change', { panelPosition })
    })

    editorControls.append(colorInput)

    pickerAreaElement = currentDocument.createElement('div')
    pickerAreaElement.className = 'picker-area'
    pickerAreaElement.addEventListener('pointerdown', (event) => {
      if (!pickerState || !pickerAreaElement) {
        return
      }

      const updateFromPointer = (pointerEvent: PointerEvent): void => {
        const rect = pickerAreaElement?.getBoundingClientRect()
        if (!rect || !pickerState) {
          return
        }

        pickerState.s = clamp(((pointerEvent.clientX - rect.left) / rect.width) * 100, 0, 100)
        pickerState.l = 100 - clamp(((pointerEvent.clientY - rect.top) / rect.height) * 100, 0, 100)
        commitPickerColor()
      }

      updateFromPointer(event)

      const handleMove = (moveEvent: PointerEvent): void => {
        updateFromPointer(moveEvent)
      }

      const handleUp = (): void => {
        currentWindow.removeEventListener('pointermove', handleMove)
        currentWindow.removeEventListener('pointerup', handleUp)
        options.onCommit?.('change', { panelPosition })
      }

      currentWindow.addEventListener('pointermove', handleMove)
      currentWindow.addEventListener('pointerup', handleUp)
    })

    pickerThumbElement = currentDocument.createElement('div')
    pickerThumbElement.className = 'picker-thumb'
    pickerAreaElement.append(pickerThumbElement)

    hueInput = currentDocument.createElement('input')
    hueInput.type = 'range'
    hueInput.className = 'picker-hue'
    hueInput.min = '0'
    hueInput.max = '360'
    hueInput.step = '1'
    hueInput.addEventListener('input', () => {
      if (!pickerState || !hueInput) {
        return
      }

      pickerState.h = Number(hueInput.value)
      commitPickerColor()
    })
    hueInput.addEventListener('change', () => {
      options.onCommit?.('change', { panelPosition })
    })

    const pickerInline = currentDocument.createElement('div')
    pickerInline.className = 'picker-inline'
    pickerInline.append(pickerAreaElement, hueInput)

    const actionButtons = currentDocument.createElement('div')
    actionButtons.className = 'footer-actions'

    resetButton = currentDocument.createElement('button')
    resetButton.type = 'button'
    resetButton.className = 'ghost-button'
    resetButton.textContent = messages.reset
    resetButton.addEventListener('click', () => {
      if (!selectedName) {
        return
      }

      session.resetVar(selectedName)
      statusText = `Reset ${selectedName}.`
      render()
      options.onCommit?.('reset', { panelPosition })
    })

    resetAllButton = currentDocument.createElement('button')
    resetAllButton.type = 'button'
    resetAllButton.className = 'ghost-button'
    resetAllButton.textContent = messages.resetAll
    resetAllButton.addEventListener('click', () => {
      session.resetAll()
      statusText = 'All variables were reset.'
      render()
      options.onCommit?.('resetAll', { panelPosition })
    })

    actionButtons.append(resetButton, resetAllButton)
    editorActions.append(editorControls, actionButtons)
    editor.append(editorTop, pickerInline, editorActions)

    const searchSection = currentDocument.createElement('div')
    searchSection.className = 'search'
    searchInput = currentDocument.createElement('input')
    searchInput.type = 'search'
    searchInput.placeholder = messages.searchPlaceholder
    searchInput.addEventListener('input', () => {
      search = searchInput?.value ?? ''
      statusText = search ? `Filtered by ${search}.` : 'Filter cleared.'
      render()
    })
    searchSection.append(searchInput)

    listElement = currentDocument.createElement('div')
    listElement.className = 'list'

    emptyStateElement = currentDocument.createElement('div')
    emptyStateElement.className = 'empty-state'
    emptyCopyElement = currentDocument.createElement('p')
    emptyCopyElement.className = 'empty-copy'
    emptyStateElement.append(emptyCopyElement)
    listElement.append(emptyStateElement)

    const footer = currentDocument.createElement('div')
    footer.className = 'footer'

    statusElement = currentDocument.createElement('p')
    statusElement.className = 'status-text'

    const footerActions = currentDocument.createElement('div')
    footerActions.className = 'footer-actions'

    menuButton = currentDocument.createElement('button')
    menuButton.type = 'button'
    menuButton.className = 'ghost-button menu-button'
    menuButton.dataset.noDrag = 'true'
    menuButton.textContent = '⋯'
    menuButton.setAttribute('aria-label', 'More actions')
    menuButton.addEventListener('click', () => {
      toggleActionMenu()
    })

    actionMenu = currentDocument.createElement('div')
    actionMenu.className = 'action-menu'
    actionMenu.hidden = true

    copyJsonButton = currentDocument.createElement('button')
    copyJsonButton.type = 'button'
    copyJsonButton.className = 'ghost-button'
    copyJsonButton.textContent = messages.copyJson
    copyJsonButton.addEventListener('click', () => {
      void handleCopyJson()
    })

    downloadCssButton = currentDocument.createElement('button')
    downloadCssButton.type = 'button'
    downloadCssButton.className = 'ghost-button'
    downloadCssButton.textContent = messages.downloadCss
    downloadCssButton.addEventListener('click', () => {
      handleDownload('css')
    })

    downloadJsonButton = currentDocument.createElement('button')
    downloadJsonButton.type = 'button'
    downloadJsonButton.className = 'ghost-button'
    downloadJsonButton.textContent = messages.downloadJson
    downloadJsonButton.addEventListener('click', () => {
      handleDownload('json')
    })

    copyCssButton = currentDocument.createElement('button')
    copyCssButton.type = 'button'
    copyCssButton.className = 'primary-button'
    copyCssButton.textContent = messages.copyCss
    copyCssButton.addEventListener('click', () => {
      void handleCopyCss()
    })

    clearPersistedButton = currentDocument.createElement('button')
    clearPersistedButton.type = 'button'
    clearPersistedButton.className = 'ghost-button'
    clearPersistedButton.textContent = messages.clearPersisted
    clearPersistedButton.hidden = !options.storageEnabled
    clearPersistedButton.addEventListener('click', () => {
      options.onClearPersisted?.()
      statusText = 'Persisted state cleared.'
      closeActionMenu()
      updateFooter()
    })

    actionMenu.append(copyJsonButton, downloadCssButton, downloadJsonButton, clearPersistedButton)
    footerActions.append(actionMenu, menuButton)
    footerActions.append(copyCssButton)
    footer.append(statusElement, footerActions)

    panel.append(header, editor, searchSection, listElement, footer)
    root.append(panel)
  }

  function show(): void {
    if (destroyed || isSessionInert()) {
      return
    }

    ensurePanel()
    visible = true
    statusText = 'Panel opened.'
    render()
  }

  function hide(): void {
    if (destroyed || isSessionInert()) {
      return
    }

    visible = false
    closeActionMenu()
    statusText = 'Panel hidden.'
    render()
    options.onCommit?.('hide', { panelPosition })
  }

  function toggle(): void {
    if (destroyed || isSessionInert()) {
      return
    }

    if (visible) {
      hide()
      return
    }

    show()
  }

  function destroy(): void {
    if (destroyed) {
      return
    }

    destroyed = true
    stopDrag()
    currentWindow.removeEventListener('resize', handleResize)
    host.remove()
  }

  toggleButton.addEventListener('click', () => {
    if (toggleDragState?.moved) {
      return
    }

    toggle()
  })
  toggleButton.addEventListener('pointerdown', (event) => {
    const rect = toggleButton.getBoundingClientRect()

    togglePosition = {
      left: rect.left,
      top: rect.top
    }

    toggleDragState = {
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top,
      moved: false
    }

    currentWindow.addEventListener('pointermove', handleTogglePointerMove)
    currentWindow.addEventListener('pointerup', stopToggleDrag)
  })
  currentWindow.addEventListener('resize', handleResize)
  currentWindow.addEventListener('pointerdown', (event) => {
    if (!menuOpen || !actionMenu || !menuButton) {
      return
    }

    const target = event.target
    if (!(target instanceof Node)) {
      return
    }

    if (actionMenu.contains(target) || menuButton.contains(target)) {
      return
    }

    closeActionMenu()
  })
  updateToggleButton()
  applyTogglePosition()

  if (options.defaultOpen) {
    show()
  }

  return {
    show,
    hide,
    toggle,
    getPanelPosition() {
      return panelPosition
    },
    destroy
  }
}

function clamp(value: number, min: number, max: number): number {
  if (max < min) {
    return min
  }

  return Math.min(Math.max(value, min), max)
}
