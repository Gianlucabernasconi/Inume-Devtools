export type CssVarsLocale = 'auto' | 'en' | 'es'
export type CssVarsProductionGuard = 'strict' | 'warn' | 'off'

export interface CssVarsMessages {
  title: string
  searchPlaceholder: string
  noResults: string
  rawValue: string
  alpha: string
  reset: string
  resetAll: string
  copyCss: string
  copyJson: string
  downloadCss: string
  downloadJson: string
  clearPersisted: string
  devOnly: string
  close: string
  open: string
}

export interface CssVarsStorageOptions {
  kind?: 'local' | 'session'
  key?: string
}

export interface CssVarsSessionOptions {
  target?: Document
  prefixes?: string[]
  include?: string[]
  exclude?: string[]
  match?: (name: string) => boolean
  allowRaw?: boolean
}

export interface CssVarItem {
  name: string
  value: string
  baselineValue: string
  exportable: boolean
  editableAsColor: boolean
}

export interface CssVarsSession {
  getVars(): CssVarItem[]
  getVar(name: string): CssVarItem | undefined
  setVar(name: string, value: string): void
  resetVar(name: string): void
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
