import { createCssVarsSession } from '../core/create-session'
import type {
  CssVarsDevtoolHandle,
  CssVarsDevtoolOptions,
  CssVarsSession,
  CssVarsSessionOptions
} from '../shared/types'
import { shouldBlockInCurrentEnvironment } from './production-guard'

function createInertHandle(): CssVarsDevtoolHandle {
  return {
    show() {},
    hide() {},
    toggle() {},
    clearPersisted() {},
    destroy() {}
  }
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

  if (shouldBlockInCurrentEnvironment(options.productionGuard ?? 'strict')) {
    return createInertHandle()
  }

  let destroyed = false
  let visible = options.defaultOpen === true
  let ownedSession: CssVarsSession | undefined
  const session = 'session' in options && options.session ? options.session : createCssVarsSession(pickSessionOptions(options))

  if (!('session' in options) || !options.session) {
    ownedSession = session
  }

  return {
    show() {
      if (destroyed) {
        return
      }

      visible = true
    },

    hide() {
      if (destroyed) {
        return
      }

      visible = false
    },

    toggle() {
      if (destroyed) {
        return
      }

      visible = !visible
    },

    clearPersisted() {
      if (destroyed) {
        return
      }

      void visible
    },

    destroy() {
      if (destroyed) {
        return
      }

      destroyed = true
      visible = false
      ownedSession?.destroy()
    }
  }
}
