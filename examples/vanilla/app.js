import { createCssVarsSession } from '../../dist/index.js'

const VAR_DEFINITIONS = [
  { name: '--color-base', label: 'Base' },
  { name: '--color-surface', label: 'Surface' },
  { name: '--color-primary', label: 'Primary' },
  { name: '--color-text-primary', label: 'Text primary' }
]

const root = document.documentElement

if (!root.style.getPropertyValue('--color-base').trim()) {
  root.style.setProperty('--color-base', '#0b1020')
  root.style.setProperty('--color-surface', '#141b34')
  root.style.setProperty('--color-primary', '#8b5cf6')
  root.style.setProperty('--color-text-primary', '#f8fafc')
}

const session = createCssVarsSession({
  prefixes: ['--color-']
})

const controlsContainer = document.querySelector('#controls')
const cssOutput = document.querySelector('#css-output')
const jsonOutput = document.querySelector('#json-output')
const sessionStatus = document.querySelector('#session-status')
const browserStatus = document.querySelector('#browser-status')

function randomHexColor() {
  return `#${Math.floor(Math.random() * 0xffffff)
    .toString(16)
    .padStart(6, '0')}`
}

function updateOutputs(message = 'Session updated.') {
  cssOutput.textContent = session.exportCss()
  jsonOutput.textContent = session.exportJson()
  sessionStatus.textContent = message
}

function refreshControls() {
  const items = session.getVars()

  controlsContainer.replaceChildren()

  for (const definition of VAR_DEFINITIONS) {
    const item = items.find((entry) => entry.name === definition.name)
    if (!item) {
      continue
    }

    const row = document.createElement('div')
    row.className = 'control-row'

    const meta = document.createElement('div')
    meta.className = 'control-meta'

    const title = document.createElement('label')
    title.textContent = definition.label
    title.setAttribute('for', `input-${definition.name}`)

    const name = document.createElement('code')
    name.textContent = item.name

    meta.append(title, name)

    const field = document.createElement('input')
    field.type = 'color'
    field.id = `input-${definition.name}`
    field.value = toHex(item.value)
    field.addEventListener('input', () => {
      session.setVar(item.name, field.value)
      updateOutputs(`Updated ${item.name}.`)
    })

    const value = document.createElement('span')
    value.className = 'control-value'
    value.textContent = item.value

    field.addEventListener('input', () => {
      const next = session.getVar(item.name)
      value.textContent = next ? next.value : field.value
    })

    const resetButton = document.createElement('button')
    resetButton.type = 'button'
    resetButton.className = 'ghost'
    resetButton.textContent = 'Reset'
    resetButton.addEventListener('click', () => {
      session.resetVar(item.name)
      const next = session.getVar(item.name)
      if (next) {
        field.value = toHex(next.value)
        value.textContent = next.value
      }
      updateOutputs(`Reset ${item.name} to baseline.`)
    })

    row.append(meta, field, value, resetButton)
    controlsContainer.append(row)
  }
}

function toHex(value) {
  const trimmed = value.trim()

  if (/^#[\da-f]{6}$/i.test(trimmed)) {
    return trimmed
  }

  const rgbMatch = trimmed.match(/^rgb\((\d+)\s+(\d+)\s+(\d+)\s*\/\s*1\)$/i)
  if (!rgbMatch) {
    return '#000000'
  }

  return `#${rgbMatch
    .slice(1)
    .map((channel) => Number(channel).toString(16).padStart(2, '0'))
    .join('')}`
}

document.querySelector('#randomize-btn')?.addEventListener('click', () => {
  for (const definition of VAR_DEFINITIONS) {
    session.setVar(definition.name, randomHexColor())
  }

  refreshControls()
  updateOutputs('Randomized the current palette.')
})

document.querySelector('#reset-all-btn')?.addEventListener('click', () => {
  session.resetAll()
  refreshControls()
  updateOutputs('Reset all variables to baseline.')
})

document.querySelector('#refresh-btn')?.addEventListener('click', () => {
  refreshControls()
  updateOutputs('Refreshed the current session snapshot.')
})

document.querySelector('#copy-css-btn')?.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(session.exportCss())
    sessionStatus.textContent = 'Copied CSS export to clipboard.'
  } catch (error) {
    sessionStatus.textContent = `Clipboard failed: ${error.message}`
  }
})

document.querySelector('#copy-json-btn')?.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(session.exportJson())
    sessionStatus.textContent = 'Copied JSON export to clipboard.'
  } catch (error) {
    sessionStatus.textContent = `Clipboard failed: ${error.message}`
  }
})

refreshControls()
updateOutputs('Session ready.')

const isLocalDevHost =
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1' ||
  window.location.hostname === '::1'

if (isLocalDevHost && typeof window !== 'undefined') {
  import('../../dist/browser.js')
    .then(({ mountCssVarsDevtool }) => {
      mountCssVarsDevtool({
        prefixes: ['--color-'],
        productionGuard: 'strict'
      })

      browserStatus.textContent = 'Browser entry loaded through dynamic import.'
    })
    .catch((error) => {
      browserStatus.textContent = `Browser entry failed to load: ${error.message}`
    })
}
