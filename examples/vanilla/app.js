import { createCssVarsSession } from '../../dist/index.js'

const UI_LABELS = {
  sessionReady: 'Session ready.',
  sessionUpdated: 'Session updated.',
  randomized: 'Randomized the current palette.',
  resetAll: 'Reset all variables to baseline.',
  refreshed: 'Refreshed the current session snapshot.',
  copiedCss: 'Copied CSS export to clipboard.',
  copiedJson: 'Copied JSON export to clipboard.',
  startedCssDownload: 'Started CSS download.',
  startedJsonDownload: 'Started JSON download.',
  browserNotLoaded: 'Browser entry not loaded',
  browserLoaded: 'Browser entry loaded through dynamic import.',
  browserFailed: 'Browser entry failed to load:',
  clipboardFailed: 'Clipboard failed:',
  pickerTitle: 'Color picker',
  pickerClose: 'Close',
  pickerCancel: 'Cancel',
  pickerApply: 'Apply',
  pickColorFor: (name) => `Pick color for ${name}`,
  reset: 'Reset',
  restored: (name) => `Restored ${name}.`,
  updated: (name) => `Updated ${name}.`,
  resetToBaseline: (name) => `Reset ${name} to baseline.`
}

const root = document.documentElement
const session = createCssVarsSession()

const controlsContainer = document.querySelector('#controls')
const cssOutput = document.querySelector('#css-output')
const jsonOutput = document.querySelector('#json-output')
const sessionStatus = document.querySelector('#session-status')
const browserStatus = document.querySelector('#browser-status')

let activePicker = null

function downloadText(content, filename, mimeType) {
  const url = URL.createObjectURL(new Blob([content], { type: mimeType }))
  const anchor = document.createElement('a')

  anchor.href = url
  anchor.download = filename
  anchor.style.display = 'none'

  document.body.append(anchor)
  anchor.click()
  anchor.remove()

  setTimeout(() => {
    URL.revokeObjectURL(url)
  }, 1000)
}

function randomHexColor() {
  return `#${Math.floor(Math.random() * 0xffffff)
    .toString(16)
    .padStart(6, '0')}`
}

function updateOutputs(message = UI_LABELS.sessionUpdated) {
  cssOutput.textContent = session.exportCss()
  jsonOutput.textContent = session.exportJson()
  sessionStatus.textContent = message
}

function ensurePicker() {
  let picker = document.querySelector('#custom-picker')
  if (picker) {
    return picker
  }

  picker = document.createElement('div')
  picker.id = 'custom-picker'
  picker.className = 'custom-picker'
  picker.hidden = true
  picker.innerHTML = `
    <div class="custom-picker__header">
      <strong class="custom-picker__title">${UI_LABELS.pickerTitle}</strong>
      <button type="button" class="custom-picker__close ghost">${UI_LABELS.pickerClose}</button>
    </div>
    <div class="custom-picker__preview-row">
      <div class="custom-picker__preview"></div>
      <input class="custom-picker__hex" type="text" maxlength="7" spellcheck="false" />
    </div>
    <div class="custom-picker__area-wrap">
      <div class="custom-picker__area">
        <div class="custom-picker__area-thumb"></div>
      </div>
      <input class="custom-picker__hue" type="range" min="0" max="360" step="1" />
    </div>
    <div class="custom-picker__footer">
      <button type="button" class="custom-picker__cancel ghost">${UI_LABELS.pickerCancel}</button>
      <button type="button" class="custom-picker__apply">${UI_LABELS.pickerApply}</button>
    </div>
  `

  document.body.append(picker)
  return picker
}

function updatePickerUi(picker) {
  const preview = picker.querySelector('.custom-picker__preview')
  const hexInput = picker.querySelector('.custom-picker__hex')
  const area = picker.querySelector('.custom-picker__area')
  const thumb = picker.querySelector('.custom-picker__area-thumb')
  const hueInput = picker.querySelector('.custom-picker__hue')

  const { h, s, l, hex } = activePicker
  preview.style.background = hex
  hexInput.value = hex
  hueInput.value = String(Math.round(h))
  area.style.background = `linear-gradient(to top, black, transparent), linear-gradient(to right, white, hsl(${h} 100% 50%))`
  thumb.style.left = `${s}%`
  thumb.style.top = `${100 - l}%`
}

function applyPickerValue(picker, commitMessage) {
  if (!activePicker) {
    return
  }

  const { name, swatch, value } = activePicker
  session.setVar(name, activePicker.hex)
  const next = session.getVar(name)
  const nextValue = next ? next.value : activePicker.hex

  swatch.style.background = nextValue
  value.textContent = nextValue
  updateOutputs(commitMessage)
  updatePickerUi(picker)
}

function closePicker(restore) {
  const picker = document.querySelector('#custom-picker')
  if (!picker || !activePicker) {
    activePicker = null
    return
  }

  if (restore) {
    session.setVar(activePicker.name, activePicker.initialHex)
    const next = session.getVar(activePicker.name)
    const nextValue = next ? next.value : activePicker.initialHex
    activePicker.swatch.style.background = nextValue
    activePicker.value.textContent = nextValue
    updateOutputs(UI_LABELS.restored(activePicker.name))
  }

  picker.hidden = true
  activePicker = null
}

function openPicker(name, swatch, value) {
  const picker = ensurePicker()
  const current = session.getVar(name)
  const initialHex = toHex(current ? current.value : '#000000')
  const { h, s, l } = hexToHsl(initialHex)

  activePicker = {
    name,
    swatch,
    value,
    initialHex,
    hex: initialHex,
    h,
    s,
    l
  }

  updatePickerUi(picker)
  picker.hidden = false
}

function bindPicker() {
  const picker = ensurePicker()
  const area = picker.querySelector('.custom-picker__area')
  const hueInput = picker.querySelector('.custom-picker__hue')
  const hexInput = picker.querySelector('.custom-picker__hex')

  picker.querySelector('.custom-picker__close').addEventListener('click', () => {
    closePicker(true)
  })

  picker.querySelector('.custom-picker__cancel').addEventListener('click', () => {
    closePicker(true)
  })

  picker.querySelector('.custom-picker__apply').addEventListener('click', () => {
    if (!activePicker) {
      return
    }

    applyPickerValue(picker, UI_LABELS.updated(activePicker.name))
    closePicker(false)
  })

  hueInput.addEventListener('input', () => {
    if (!activePicker) {
      return
    }

    activePicker.h = Number(hueInput.value)
    activePicker.hex = hslToHex(activePicker.h, activePicker.s, activePicker.l)
    applyPickerValue(picker, UI_LABELS.updated(activePicker.name))
  })

  hexInput.addEventListener('change', () => {
    if (!activePicker) {
      return
    }

    const normalized = normalizeHex(hexInput.value)
    if (!normalized) {
      updatePickerUi(picker)
      return
    }

    const next = hexToHsl(normalized)
    activePicker.hex = normalized
    activePicker.h = next.h
    activePicker.s = next.s
    activePicker.l = next.l
    applyPickerValue(picker, UI_LABELS.updated(activePicker.name))
  })

  let dragging = false

  function updateFromArea(event) {
    if (!activePicker) {
      return
    }

    const rect = area.getBoundingClientRect()
    const x = clamp(((event.clientX - rect.left) / rect.width) * 100, 0, 100)
    const y = clamp(((event.clientY - rect.top) / rect.height) * 100, 0, 100)

    activePicker.s = x
    activePicker.l = 100 - y
    activePicker.hex = hslToHex(activePicker.h, activePicker.s, activePicker.l)
    applyPickerValue(picker, `Updated ${activePicker.name}.`)
  }

  area.addEventListener('pointerdown', (event) => {
    dragging = true
    updateFromArea(event)
  })

  window.addEventListener('pointermove', (event) => {
    if (!dragging) {
      return
    }

    updateFromArea(event)
  })

  window.addEventListener('pointerup', () => {
    dragging = false
  })
}

function refreshControls() {
  const items = session.getVars()

  controlsContainer.replaceChildren()

  for (const item of items) {
    const labelText = humanizeVarName(item.name)

    const row = document.createElement('div')
    row.className = 'control-row'

    const meta = document.createElement('div')
    meta.className = 'control-meta'

    const title = document.createElement('label')
    title.textContent = labelText
    title.setAttribute('for', `input-${item.name}`)

    const name = document.createElement('code')
    name.textContent = item.name

    meta.append(title, name)

    const value = document.createElement('span')
    value.className = 'control-value'
    value.textContent = item.value

    const pickerButton = document.createElement('button')
    pickerButton.type = 'button'
    pickerButton.className = 'control-picker-button'
    pickerButton.setAttribute('aria-label', UI_LABELS.pickColorFor(labelText))
    pickerButton.addEventListener('click', () => {
      openPicker(item.name, pickerSwatch, value)
    })

    const pickerSwatch = document.createElement('span')
    pickerSwatch.className = 'control-picker-swatch'
    pickerSwatch.style.background = item.value

    pickerButton.append(pickerSwatch)

    value.addEventListener('click', () => {
      openPicker(item.name, pickerSwatch, value)
    })

    const resetButton = document.createElement('button')
    resetButton.type = 'button'
    resetButton.className = 'ghost'
    resetButton.textContent = UI_LABELS.reset
    resetButton.addEventListener('click', () => {
      session.resetVar(item.name)
      const next = session.getVar(item.name)
      if (next) {
        value.textContent = next.value
        pickerSwatch.style.background = next.value
      }
      updateOutputs(UI_LABELS.resetToBaseline(item.name))
    })

    row.addEventListener('click', (event) => {
      if (event.target instanceof HTMLButtonElement && event.target === resetButton) {
        return
      }

      openPicker(item.name, pickerSwatch, value)
    })

    row.append(meta, pickerButton, value, resetButton)
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

function normalizeHex(value) {
  const trimmed = value.trim().toLowerCase()
  return /^#[\da-f]{6}$/i.test(trimmed) ? trimmed : null
}

function hexToHsl(hex) {
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

function hslToHex(hue, saturation, lightness) {
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

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

document.querySelector('#randomize-btn')?.addEventListener('click', () => {
  for (const item of session.getVars()) {
    session.setVar(item.name, randomHexColor())
  }

  refreshControls()
  updateOutputs(UI_LABELS.randomized)
})

document.querySelector('#reset-all-btn')?.addEventListener('click', () => {
  session.resetAll()
  refreshControls()
  updateOutputs(UI_LABELS.resetAll)
})

document.querySelector('#refresh-btn')?.addEventListener('click', () => {
  refreshControls()
  updateOutputs(UI_LABELS.refreshed)
})

document.querySelector('#copy-css-btn')?.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(session.exportCss())
    sessionStatus.textContent = UI_LABELS.copiedCss
  } catch (error) {
    sessionStatus.textContent = `${UI_LABELS.clipboardFailed} ${error.message}`
  }
})

document.querySelector('#copy-json-btn')?.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(session.exportJson())
    sessionStatus.textContent = UI_LABELS.copiedJson
  } catch (error) {
    sessionStatus.textContent = `${UI_LABELS.clipboardFailed} ${error.message}`
  }
})

document.querySelector('#download-css-btn')?.addEventListener('click', () => {
  downloadText(session.exportCss(), 'vanilla-sample.css', 'text/css;charset=utf-8')
  sessionStatus.textContent = UI_LABELS.startedCssDownload
})

document.querySelector('#download-json-btn')?.addEventListener('click', () => {
  downloadText(session.exportJson(), 'vanilla-sample.json', 'application/json;charset=utf-8')
  sessionStatus.textContent = UI_LABELS.startedJsonDownload
})

refreshControls()
updateOutputs(UI_LABELS.sessionReady)
bindPicker()

const isLocalDevHost =
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1' ||
  window.location.hostname === '::1'

if (isLocalDevHost && typeof window !== 'undefined') {
  import('../../dist/browser.js')
    .then(({ mountCssVarsDevtool }) => {
      mountCssVarsDevtool({
        productionGuard: 'strict'
      })

      browserStatus.textContent = UI_LABELS.browserLoaded
    })
    .catch((error) => {
      browserStatus.textContent = `${UI_LABELS.browserFailed} ${error.message}`
    })
}

function humanizeVarName(name) {
  return name
    .replace(/^--/, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (match) => match.toUpperCase())
}
