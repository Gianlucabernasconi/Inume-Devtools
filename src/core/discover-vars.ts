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
  entries: Map<string, DiscoveryEntry>
}

export interface DiscoveryEntry {
  key: string
  name: string
  scope: string
  element: Element
  baselineValue: string
}

const ROOT_SCOPE = ':root'

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

  const filters = resolveFilters(options)
  const entries = new Map<string, DiscoveryEntry>()
  const scopedElements = resolveScopedElements(target, root, options.scopes)

  try {
    for (const scopedElement of scopedElements) {
      const computedStyle = getComputedStyleFn(scopedElement.element)

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

        const key = createScopedVarKey(scopedElement.scope, name)
        entries.set(key, {
          key,
          name,
          scope: scopedElement.scope,
          element: scopedElement.element,
          baselineValue: validation.normalizedValue
        })
      }
    }
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Falló el discovery de CSS vars: ${error.message}`)
    }

    throw error
  }

  return { target, entries }
}

export function createScopedVarKey(scope: string, name: string): string {
  return scope === ROOT_SCOPE ? name : `${scope}\n${name}`
}

function resolveScopedElements(target: Document, root: Element, scopes: string[] | undefined): Array<{ scope: string; element: Element }> {
  const scopedElements: Array<{ scope: string; element: Element }> = [{ scope: ROOT_SCOPE, element: root }]

  for (const scope of scopes ?? []) {
    const selector = scope.trim()
    if (!selector || selector === ROOT_SCOPE) {
      continue
    }

    try {
      const element = target.querySelector(selector)
      if (element) {
        scopedElements.push({ scope: selector, element })
      }
    } catch {
      // Invalid optional scopes should not prevent the base :root session from mounting.
    }
  }

  return scopedElements
}
