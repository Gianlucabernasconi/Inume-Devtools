import type { CssVarItem, CssVarsDevtoolOptions, CssVarsSession, CssVarsStorageOptions } from '../shared/types'
import { STORAGE_SCHEMA_VERSION, type PersistedOverlayState, type PersistedPanelPosition } from './storage-schema'

const activeImplicitKeys = new Set<string>()

export interface StorageCommitState {
  panelPosition?: PersistedPanelPosition
}

export interface StorageController {
  enabled: boolean
  initialPanelPosition?: PersistedPanelPosition
  persist(reason: 'change' | 'reset' | 'resetAll' | 'hide' | 'copyCss', state: StorageCommitState): void
  clear(): void
  destroy(): void
}

interface StorageControllerOptions {
  options: CssVarsDevtoolOptions
  session: CssVarsSession
  currentWindow: Window
}

export function createStorageController({ options, session, currentWindow }: StorageControllerOptions): StorageController {
  if (options.storage === false || options.storage === undefined) {
    return createDisabledController()
  }

  if ('match' in options && options.match && !options.storage.key) {
    throw new Error('mountCssVarsDevtool() requiere storage.key explícita cuando se usa match con storage activo.')
  }

  const browserStorage = resolveStorage(currentWindow, options.storage)
  if (!browserStorage) {
    return createDisabledController()
  }

  const storage = browserStorage

  const explicitKey = Boolean(options.storage.key)
  const key = options.storage.key ?? buildDefaultStorageKey(options, currentWindow)

  if (!explicitKey && activeImplicitKeys.has(key)) {
    throw new Error('mountCssVarsDevtool() requiere storage.key explícita para múltiples mounts persistentes en la misma ruta.')
  }

  if (!explicitKey) {
    activeImplicitKeys.add(key)
  }

  let destroyed = false
  let clearedUntilUserCommit = false
  let flushTimer: ReturnType<typeof setTimeout> | undefined
  let lastSerialized = safeReadRaw(storage, key)
  const restoredState = safeReadState(storage, key)

  if (restoredState) {
    for (const [name, value] of Object.entries(restoredState.vars)) {
      session.setVar(name, value)
    }
  }

  function persist(reason: 'change' | 'reset' | 'resetAll' | 'hide' | 'copyCss', state: StorageCommitState): void {
    if (destroyed) {
      return
    }

    if (clearedUntilUserCommit && !isUserCommit(reason)) {
      return
    }

    if (clearedUntilUserCommit && isUserCommit(reason)) {
      clearedUntilUserCommit = false
    }

    const payload = buildPersistedState(session.getVars(), state.panelPosition)
    const nextSerialized = JSON.stringify(payload)

    if (nextSerialized === lastSerialized) {
      return
    }

    if (flushTimer) {
      clearTimeout(flushTimer)
    }

    flushTimer = setTimeout(() => {
      flushTimer = undefined

      try {
        if (isStateEmpty(payload)) {
          storage.removeItem(key)
          lastSerialized = null
          return
        }

        storage.setItem(key, nextSerialized)
        lastSerialized = nextSerialized
      } catch {
        // storage failures must never break the devtool
      }
    }, 40)
  }

  function clear(): void {
    if (destroyed) {
      return
    }

    if (flushTimer) {
      clearTimeout(flushTimer)
      flushTimer = undefined
    }

    try {
      storage.removeItem(key)
    } catch {
      // ignore storage removal failures
    }

    lastSerialized = null
    clearedUntilUserCommit = true
  }

  function destroy(): void {
    if (destroyed) {
      return
    }

    destroyed = true

    if (flushTimer) {
      clearTimeout(flushTimer)
      flushTimer = undefined
    }

    if (!explicitKey) {
      activeImplicitKeys.delete(key)
    }
  }

  return {
    enabled: true,
    initialPanelPosition: restoredState?.panelPosition,
    persist,
    clear,
    destroy
  }
}

function createDisabledController(): StorageController {
  return {
    enabled: false,
    persist() {},
    clear() {},
    destroy() {}
  }
}

function resolveStorage(currentWindow: Window, storageOptions: CssVarsStorageOptions): Storage | undefined {
  try {
    return storageOptions.kind === 'session' ? currentWindow.sessionStorage : currentWindow.localStorage
  } catch {
    return undefined
  }
}

function buildDefaultStorageKey(options: CssVarsDevtoolOptions, currentWindow: Window): string {
  const host = currentWindow.location.hostname || 'unknown-host'
  const path = currentWindow.location.pathname || '/'
  const scope = buildScopeSignature(options)

  return `@inume/css-vars-devtools:v1:${host}:${path}:${scope}`
}

function buildScopeSignature(options: CssVarsDevtoolOptions): string {
  if ('session' in options && options.session) {
    return 'external-session'
  }

  const prefixes = normalizeList(options.prefixes)
  const include = normalizeList(options.include)
  const exclude = normalizeList(options.exclude)

  return encodeURIComponent(
    [`prefixes=${prefixes.join(',') || '--color-'}`, `include=${include.join(',') || '-'}`, `exclude=${exclude.join(',') || '-'}`].join('|')
  )
}

function normalizeList(values: string[] | undefined): string[] {
  return [...(values ?? [])].map((value) => value.trim()).filter(Boolean).sort((left, right) => left.localeCompare(right))
}

function safeReadRaw(storage: Storage, key: string): string | null {
  try {
    return storage.getItem(key)
  } catch {
    return null
  }
}

function safeReadState(storage: Storage, key: string): PersistedOverlayState | undefined {
  const raw = safeReadRaw(storage, key)
  if (!raw) {
    return undefined
  }

  try {
    const parsed = JSON.parse(raw) as PersistedOverlayState
    return isValidState(parsed) ? parsed : undefined
  } catch {
    return undefined
  }
}

function isValidState(value: unknown): value is PersistedOverlayState {
  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as PersistedOverlayState
  if (candidate.version !== STORAGE_SCHEMA_VERSION || !candidate.vars || typeof candidate.vars !== 'object') {
    return false
  }

  if (candidate.panelPosition) {
    return Number.isFinite(candidate.panelPosition.left) && Number.isFinite(candidate.panelPosition.top)
  }

  return true
}

function buildPersistedState(items: CssVarItem[], panelPosition?: PersistedPanelPosition): PersistedOverlayState {
  return {
    version: STORAGE_SCHEMA_VERSION,
    vars: Object.fromEntries(items.filter((item) => item.value !== item.baselineValue).map((item) => [item.name, item.value])),
    panelPosition
  }
}

function isStateEmpty(state: PersistedOverlayState): boolean {
  return Object.keys(state.vars).length === 0 && state.panelPosition === undefined
}

function isUserCommit(reason: 'change' | 'reset' | 'resetAll' | 'hide' | 'copyCss'): boolean {
  return reason === 'change' || reason === 'reset' || reason === 'resetAll'
}
