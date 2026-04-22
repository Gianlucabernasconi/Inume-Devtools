import { shouldIncludeName, resolveFilters } from './filters'
import { normalizeCustomPropertyName } from '../shared/normalize-name'
import { normalizeColorValue } from '../shared/normalize-color'
import { validateExportableValue } from '../shared/validate-exportable-value'
import type { CssVarsSessionOptions } from '../shared/types'

function resolveTargetDocument(target?: Document): Document {
  if (target) {
    return target
  }

  if (typeof document !== 'undefined') {
    return document
  }

  throw new Error('createCssVarsSession() requiere un Document resolvible en runtime.')
}

export interface DiscoveryResult {
  target: Document
  baseline: Map<string, string>
}

export function discoverVars(options: CssVarsSessionOptions = {}): DiscoveryResult {
  const target = resolveTargetDocument(options.target)
  const root = target.documentElement

  if (!root) {
    throw new Error('createCssVarsSession() requiere un documentElement disponible.')
  }

  const getComputedStyleFn = target.defaultView?.getComputedStyle ?? globalThis.getComputedStyle
  if (!getComputedStyleFn) {
    throw new Error('createCssVarsSession() requiere getComputedStyle disponible.')
  }

  const computedStyle = getComputedStyleFn(root)
  const filters = resolveFilters(options)
  const baseline = new Map<string, string>()

  try {
    for (let index = 0; index < computedStyle.length; index += 1) {
      const rawName = computedStyle.item(index)

      // Only real custom properties belong to the session scope.
      if (!rawName.trim().startsWith('--')) {
        continue
      }

      const name = normalizeCustomPropertyName(rawName)
      const runtimeValue = normalizeColorValue(computedStyle.getPropertyValue(rawName))
      const validation = validateExportableValue(runtimeValue)

      if (!name || !validation.editableAsColor || !shouldIncludeName(name, filters)) {
        continue
      }

      baseline.set(name, validation.normalizedValue)
    }
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Falló el discovery de CSS vars: ${error.message}`)
    }

    throw error
  }

  return { target, baseline }
}
