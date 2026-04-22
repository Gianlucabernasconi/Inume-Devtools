import type { CssVarsLocale, CssVarsMessages } from '../shared/types'

const EN_MESSAGES: CssVarsMessages = {
  title: 'CSS Vars Devtools',
  searchPlaceholder: 'Search variable',
  noResults: 'No visible variables match this filter.',
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

const ES_MESSAGES: CssVarsMessages = {
  title: 'Devtools CSS Vars',
  searchPlaceholder: 'Buscar variable',
  noResults: 'No hay variables visibles para este filtro.',
  rawValue: 'Valor raw',
  alpha: 'Alpha',
  reset: 'Resetear',
  resetAll: 'Resetear todo',
  copyCss: 'Copiar CSS',
  copyJson: 'Copiar JSON',
  downloadCss: 'Descargar CSS',
  downloadJson: 'Descargar JSON',
  clearPersisted: 'Limpiar persistido',
  devOnly: 'Solo dev',
  close: 'Cerrar',
  open: 'Abrir'
}

export function resolveLocale(locale: CssVarsLocale | undefined, currentNavigator?: Navigator): Exclude<CssVarsLocale, 'auto'> {
  if (locale === 'en' || locale === 'es') {
    return locale
  }

  const primaryLanguage = currentNavigator?.language?.split('-')[0]?.toLowerCase()
  return primaryLanguage === 'es' ? 'es' : 'en'
}

export function resolveMessages(
  locale: CssVarsLocale | undefined,
  customMessages: Partial<CssVarsMessages> | undefined,
  currentNavigator?: Navigator
): CssVarsMessages {
  const resolvedLocale = resolveLocale(locale, currentNavigator)
  const localeMessages = resolvedLocale === 'es' ? ES_MESSAGES : EN_MESSAGES

  return {
    ...EN_MESSAGES,
    ...localeMessages,
    ...customMessages
  }
}

export { EN_MESSAGES, ES_MESSAGES }
