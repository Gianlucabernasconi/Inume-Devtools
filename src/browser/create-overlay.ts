import type { CssVarItem, CssVarsMessages, CssVarsSession } from '../shared/types'
import { getOverlayStyles } from './styles'

interface OverlayOptions {
  session: CssVarsSession
  title?: string
  messages?: Partial<CssVarsMessages>
  defaultOpen?: boolean
}

interface OverlayController {
  show(): void
  hide(): void
  toggle(): void
  destroy(): void
}

const DEFAULT_MESSAGES: CssVarsMessages = {
  title: 'CSS Vars Devtools',
  searchPlaceholder: 'Buscar variable',
  noResults: 'No hay variables visibles para este filtro.',
  rawValue: 'Raw value',
  alpha: 'Alpha',
  reset: 'Reset',
  resetAll: 'Reset all',
  copyCss: 'Copy CSS',
  copyJson: 'Copy JSON',
  downloadCss: 'Download CSS',
  downloadJson: 'Download JSON',
  clearPersisted: 'Clear persisted',
  devOnly: 'Dev only',
  close: 'Close',
  open: 'Open'
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

  const messages = { ...DEFAULT_MESSAGES, ...options.messages }
  const title = options.title?.trim() || messages.title

  let destroyed = false
  let visible = false
  let search = ''
  let selectedName: string | undefined
  let statusText = 'Ready.'
  let panelPosition: { left: number; top: number } | undefined
  let dragState:
    | {
        offsetX: number
        offsetY: number
      }
    | undefined

  let panel: HTMLDivElement | undefined
  let selectedNameElement: HTMLParagraphElement | undefined
  let selectedValueElement: HTMLParagraphElement | undefined
  let swatchElement: HTMLDivElement | undefined
  let colorInput: HTMLInputElement | undefined
  let resetButton: HTMLButtonElement | undefined
  let resetAllButton: HTMLButtonElement | undefined
  let searchInput: HTMLInputElement | undefined
  let listElement: HTMLDivElement | undefined
  let emptyStateElement: HTMLDivElement | undefined
  let emptyCopyElement: HTMLParagraphElement | undefined
  let statusElement: HTMLParagraphElement | undefined
  let copyCssButton: HTMLButtonElement | undefined

  const stopDrag = (): void => {
    dragState = undefined
    currentWindow.removeEventListener('pointermove', handlePointerMove)
    currentWindow.removeEventListener('pointerup', stopDrag)
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

  const handleResize = (): void => {
    if (!panel || !panelPosition) {
      return
    }

    const panelRect = panel.getBoundingClientRect()
    panelPosition = {
      left: clamp(panelPosition.left, 8, currentWindow.innerWidth - panelRect.width - 8),
      top: clamp(panelPosition.top, 8, currentWindow.innerHeight - panelRect.height - 8)
    }

    applyPanelPosition()
    statusText = 'Panel re-fitted to viewport.'
    updateFooter()
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
  }

  function updateEditor(selectedItem: CssVarItem | undefined): void {
    if (!selectedNameElement || !selectedValueElement || !swatchElement || !colorInput || !resetButton || !resetAllButton) {
      return
    }

    if (!selectedItem) {
      selectedNameElement.textContent = 'No selection'
      selectedValueElement.textContent = search ? messages.noResults : 'No variables detected.'
      swatchElement.style.background = '#0f172a'
      colorInput.value = '#000000'
      colorInput.disabled = true
      resetButton.disabled = true
      resetAllButton.disabled = session.getVars().length === 0
      return
    }

    const nextHex = toHexColor(selectedItem.value)
    selectedNameElement.textContent = selectedItem.name
    selectedValueElement.textContent = selectedItem.value
    swatchElement.style.background = selectedItem.value
    colorInput.value = nextHex ?? '#000000'
    colorInput.disabled = !selectedItem.editableAsColor || !nextHex
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
    } catch {
      statusText = 'Clipboard copy failed.'
    }

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
    colorInput.type = 'color'
    colorInput.addEventListener('input', () => {
      if (!selectedName) {
        return
      }

      session.setVar(selectedName, colorInput?.value ?? '#000000')
      statusText = `Updated ${selectedName}.`
      render()
    })

    editorControls.append(colorInput)

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
    })

    resetAllButton = currentDocument.createElement('button')
    resetAllButton.type = 'button'
    resetAllButton.className = 'ghost-button'
    resetAllButton.textContent = messages.resetAll
    resetAllButton.addEventListener('click', () => {
      session.resetAll()
      statusText = 'All variables were reset.'
      render()
    })

    actionButtons.append(resetButton, resetAllButton)
    editorActions.append(editorControls, actionButtons)
    editor.append(editorTop, editorActions)

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

    copyCssButton = currentDocument.createElement('button')
    copyCssButton.type = 'button'
    copyCssButton.className = 'primary-button'
    copyCssButton.textContent = messages.copyCss
    copyCssButton.addEventListener('click', () => {
      void handleCopyCss()
    })

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
    statusText = 'Panel hidden.'
    render()
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

  toggleButton.addEventListener('click', () => toggle())
  currentWindow.addEventListener('resize', handleResize)
  updateToggleButton()

  if (options.defaultOpen) {
    show()
  }

  return {
    show,
    hide,
    toggle,
    destroy
  }
}

function clamp(value: number, min: number, max: number): number {
  if (max < min) {
    return min
  }

  return Math.min(Math.max(value, min), max)
}
