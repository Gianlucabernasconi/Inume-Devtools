import type { CssVarsLocale, CssVarsMessages } from '../shared/types'

const EN_MESSAGES: CssVarsMessages = {
  title: 'Inume CSS Devtools',
  searchPlaceholder: 'Search variable',
  noResults: 'No visible variables match this filter.',
  noSelection: 'No selection',
  noVariablesDetected: 'No variables detected.',
  rawValue: 'Raw value',
  alpha: 'Alpha',
  reset: 'Reset',
  resetAll: 'Reset all',
  copyCss: 'Copy all',
  copyJson: 'Copy JSON',
  copyVar: 'Copy',
  downloadCss: 'Download CSS',
  downloadJson: 'Download JSON',
  clearPersisted: 'Clear persisted',
  close: 'Close',
  open: 'Open',
  moreActions: 'More actions',
  ready: 'Ready.',
  panelOpened: 'Panel opened.',
  panelHidden: 'Panel hidden.',
  panelMoved: 'Panel moved.',
  panelRefitted: 'Panel re-fitted to viewport.',
  selected: 'Selected {name}.',
  updated: 'Updated {name}.',
  resetDone: 'Reset {name}.',
  resetAllDone: 'All variables were reset.',
  filteredBy: 'Filtered by {query}.',
  filterCleared: 'Filter cleared.',
  clipboardUnavailable: 'Clipboard API is not available.',
  cssCopied: 'CSS copied to clipboard.',
  jsonCopied: 'JSON copied to clipboard.',
  varCopied: 'Variable copied to clipboard.',
  clipboardFailed: 'Clipboard copy failed.',
  cssDownloadStarted: 'CSS download started.',
  jsonDownloadStarted: 'JSON download started.',
  persistedCleared: 'Persisted state cleared.',
  hue: 'Hue'
}

const ES_MESSAGES: CssVarsMessages = {
  title: 'Inume CSS Devtools',
  searchPlaceholder: 'Buscar variable',
  noResults: 'No hay variables visibles para este filtro.',
  noSelection: 'Sin seleccion',
  noVariablesDetected: 'No se detectaron variables.',
  rawValue: 'Valor raw',
  alpha: 'Alpha',
  reset: 'Resetear',
  resetAll: 'Resetear todo',
  copyCss: 'Copiar todo',
  copyJson: 'Copiar JSON',
  copyVar: 'Copiar',
  downloadCss: 'Descargar CSS',
  downloadJson: 'Descargar JSON',
  clearPersisted: 'Limpiar persistido',
  close: 'Cerrar',
  open: 'Abrir',
  moreActions: 'Mas acciones',
  ready: 'Listo.',
  panelOpened: 'Panel abierto.',
  panelHidden: 'Panel oculto.',
  panelMoved: 'Panel movido.',
  panelRefitted: 'Panel reajustado al viewport.',
  selected: 'Seleccionada {name}.',
  updated: 'Actualizada {name}.',
  resetDone: 'Reset aplicada a {name}.',
  resetAllDone: 'Todas las variables fueron reseteadas.',
  filteredBy: 'Filtrado por {query}.',
  filterCleared: 'Filtro limpiado.',
  clipboardUnavailable: 'Clipboard API no disponible.',
  cssCopied: 'CSS copiado al portapapeles.',
  jsonCopied: 'JSON copiado al portapapeles.',
  varCopied: 'Variable copiada al portapapeles.',
  clipboardFailed: 'No se pudo copiar al portapapeles.',
  cssDownloadStarted: 'Descarga CSS iniciada.',
  jsonDownloadStarted: 'Descarga JSON iniciada.',
  persistedCleared: 'Estado persistido limpiado.',
  hue: 'Tono'
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
