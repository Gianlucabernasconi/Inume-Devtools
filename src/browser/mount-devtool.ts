import { createCssVarsSession } from '../core/create-session'
import type {
  CssVarsDevtoolHandle,
  CssVarsMessages,
  CssVarsDevtoolOptions,
  CssVarsSession,
  CssVarsSessionOptions
} from '../shared/types'
import { createOverlay } from './create-overlay'
import { getProductionGuardDecision } from './production-guard'
import { createStorageController } from './storage'

function createInertHandle(): CssVarsDevtoolHandle {
  return {
    show() {},
    hide() {},
    toggle() {},
    clearPersisted() {},
    destroy() {}
  }
}

function pickBrowserMessages(options: CssVarsDevtoolOptions): Partial<CssVarsMessages> | undefined {
  return options.messages
}

function isDestroyedSession(session: CssVarsSession): boolean {
  return session.exportCss() === '' && session.exportJson() === ''
}

function hasSessionOptionMix(options: CssVarsDevtoolOptions): boolean {
  if (!('session' in options) || !options.session) {
    return false
  }

  const candidate = options as CssVarsDevtoolOptions & Partial<CssVarsSessionOptions>

  return (
    candidate.target !== undefined ||
    candidate.prefixes !== undefined ||
    candidate.include !== undefined ||
    candidate.exclude !== undefined ||
    candidate.match !== undefined ||
    candidate.allowRaw !== undefined
  )
}

function pickSessionOptions(options: CssVarsDevtoolOptions): CssVarsSessionOptions {
  return {
    target: 'target' in options ? options.target : undefined,
    prefixes: 'prefixes' in options ? options.prefixes : undefined,
    include: 'include' in options ? options.include : undefined,
    exclude: 'exclude' in options ? options.exclude : undefined,
    match: 'match' in options ? options.match : undefined,
    allowRaw: 'allowRaw' in options ? options.allowRaw : undefined
  }
}

export function mountCssVarsDevtool(options: CssVarsDevtoolOptions = {}): CssVarsDevtoolHandle {
  if (hasSessionOptionMix(options)) {
    throw new Error('mountCssVarsDevtool() no permite mezclar session con opciones de sesión.')
  }

  const decision = getProductionGuardDecision(
    options.productionGuard ?? 'strict',
    typeof window === 'undefined' ? undefined : window
  )

  if (decision.blocked) {
    return createInertHandle()
  }

  if (decision.shouldWarn && decision.warningMessage) {
    console.warn(decision.warningMessage)
  }

  let destroyed = false
  let ownedSession: CssVarsSession | undefined
  const session = 'session' in options && options.session ? options.session : createCssVarsSession(pickSessionOptions(options))

  if (!('session' in options) || !options.session) {
    ownedSession = session
  }

  const storage = createStorageController({
    options,
    session,
    currentWindow: window
  })

  function isInert(): boolean {
    return isDestroyedSession(session)
  }

  const overlay = createOverlay({
    session,
    title: options.title,
    messages: pickBrowserMessages(options),
    defaultOpen: options.defaultOpen === true,
    storageEnabled: storage.enabled,
    initialPanelPosition: storage.initialPanelPosition,
    onCommit(reason, state) {
      storage.persist(reason, state)
    },
    onClearPersisted() {
      storage.clear()
    }
  })

  return {
    show() {
      if (destroyed || isInert()) {
        return
      }

      overlay.show()
    },

    hide() {
      if (destroyed || isInert()) {
        return
      }

      overlay.hide()
    },

    toggle() {
      if (destroyed || isInert()) {
        return
      }

      overlay.toggle()
    },

    clearPersisted() {
      if (destroyed || isInert()) {
        return
      }

      storage.clear()
    },

    destroy() {
      if (destroyed) {
        return
      }

      destroyed = true
      overlay.destroy()
      storage.destroy()
      ownedSession?.destroy()
    }
  }
}
