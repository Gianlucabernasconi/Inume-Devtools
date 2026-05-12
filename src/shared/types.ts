export type CssVarsLocale = 'auto' | 'en' | 'es'
export type CssVarsProductionGuard = 'strict' | 'warn' | 'off'

export interface CssVarsMessages {
  title: string
  searchPlaceholder: string
  noResults: string
  noSelection: string
  noVariablesDetected: string
  rawValue: string
  alpha: string
  reset: string
  resetAll: string
  copyCss: string
  copyJson: string
  copyVar: string
  downloadCss: string
  downloadJson: string
  clearPersisted: string
  close: string
  open: string
  moreActions: string
  ready: string
  panelOpened: string
  panelHidden: string
  panelMoved: string
  panelRefitted: string
  selected: string
  updated: string
  resetDone: string
  resetAllDone: string
  filteredBy: string
  filterCleared: string
  clipboardUnavailable: string
  cssCopied: string
  jsonCopied: string
  varCopied: string
  clipboardFailed: string
  cssDownloadStarted: string
  jsonDownloadStarted: string
  persistedCleared: string
  hue: string
}

export interface CssVarsStorageOptions {
  kind?: 'local' | 'session'
  key?: string
}

export interface CssVarsSessionOptions {
  target?: Document
  scopes?: string[]
  prefixes?: string[]
  include?: string[]
  exclude?: string[]
  match?: (name: string) => boolean
  allowRaw?: boolean
}

export interface CssVarsScopedOperationOptions {
  scope?: string
}

export interface CssVarItem {
  key: string
  name: string
  scope: string
  value: string
  baselineValue: string
  exportable: boolean
  editableAsColor: boolean
}

export interface CssVarsSession {
  getVars(): CssVarItem[]
  getVar(name: string, options?: CssVarsScopedOperationOptions): CssVarItem | undefined
  setVar(name: string, value: string, options?: CssVarsScopedOperationOptions): void
  resetVar(name: string, options?: CssVarsScopedOperationOptions): void
  resetAll(): void
  exportCss(): string
  exportJson(): string
  destroy(): void
}

export interface CssVarsDevtoolBrowserOptions {
  storage?: false | CssVarsStorageOptions
  locale?: CssVarsLocale
  messages?: Partial<CssVarsMessages>
  title?: string
  productionGuard?: CssVarsProductionGuard
  defaultOpen?: boolean
}

export type CssVarsDevtoolOptions =
  | (CssVarsDevtoolBrowserOptions & CssVarsSessionOptions & { session?: undefined })
  | (CssVarsDevtoolBrowserOptions & { session: CssVarsSession })

export interface CssVarsDevtoolHandle {
  show(): void
  hide(): void
  toggle(): void
  clearPersisted(): void
  destroy(): void
}

export interface CssVarValidationResult {
  normalizedValue: string
  exportable: boolean
  editableAsColor: boolean
}
