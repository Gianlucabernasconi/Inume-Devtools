import { createScopedVarKey, discoverVars, type DiscoveryEntry } from './discover-vars'
import { normalizeCustomPropertyName } from '../shared/normalize-name'
import { serializeCss } from '../shared/serialize-css'
import { serializeJson } from '../shared/serialize-json'
import { validateExportableValue } from '../shared/validate-exportable-value'
import type { CssVarItem, CssVarsScopedOperationOptions, CssVarsSession, CssVarsSessionOptions } from '../shared/types'

function toCssVarItem(entry: DiscoveryEntry, value: string): CssVarItem {
  const validation = validateExportableValue(value)

  return {
    key: entry.key,
    name: entry.name,
    scope: entry.scope,
    value,
    baselineValue: entry.baselineValue,
    exportable: validation.exportable,
    editableAsColor: validation.editableAsColor
  }
}

function getOrderedKeys(entries: Map<string, DiscoveryEntry>): string[] {
  return [...entries.values()]
    .sort((left, right) => compareScopes(left.scope, right.scope) || left.name.localeCompare(right.name))
    .map((entry) => entry.key)
}

function compareScopes(left: string, right: string): number {
  if (left === right) {
    return 0
  }

  if (left === ':root') {
    return -1
  }

  if (right === ':root') {
    return 1
  }

  return left.localeCompare(right)
}

export function createCssVarsSession(options: CssVarsSessionOptions = {}): CssVarsSession {
  const { entries } = discoverVars(options)
  const current = new Map([...entries].map(([key, entry]) => [key, entry.baselineValue]))
  const allowRaw = options.allowRaw === true
  let destroyed = false

  function setDomValue(entry: DiscoveryEntry, value: string): void {
    if (entry.element instanceof HTMLElement || entry.element instanceof SVGElement) {
      entry.element.style.setProperty(entry.name, value)
    }
  }

  function getItem(key: string): CssVarItem | undefined {
    const entry = entries.get(key)
    const value = current.get(key)

    if (!entry || value === undefined) {
      return undefined
    }

    return toCssVarItem(entry, value)
  }

  function resolveKey(name: string, operationOptions?: CssVarsScopedOperationOptions): string | undefined {
    const normalizedName = normalizeCustomPropertyName(name)
    if (!normalizedName) {
      return undefined
    }

    const requestedScope = operationOptions?.scope?.trim()
    if (requestedScope) {
      return entries.has(createScopedVarKey(requestedScope, normalizedName)) ? createScopedVarKey(requestedScope, normalizedName) : undefined
    }

    if (entries.has(normalizedName)) {
      return normalizedName
    }

    return getOrderedKeys(entries).find((key) => entries.get(key)?.name === normalizedName)
  }

  return {
    getVars() {
      if (destroyed) {
        return []
      }

      return getOrderedKeys(entries)
        .map((key) => getItem(key))
        .filter((item): item is CssVarItem => Boolean(item))
    },

    getVar(name, operationOptions) {
      if (destroyed) {
        return undefined
      }

      const key = resolveKey(name, operationOptions)
      return key ? getItem(key) : undefined
    },

    setVar(name, value, operationOptions) {
      if (destroyed) {
        return
      }

      const key = resolveKey(name, operationOptions)
      const entry = key ? entries.get(key) : undefined
      if (!key || !entry || !current.has(key)) {
        return
      }

      const validation = validateExportableValue(value)
      if (!allowRaw && !validation.exportable) {
        return
      }

      current.set(key, validation.normalizedValue)
      setDomValue(entry, validation.normalizedValue)
    },

    resetVar(name, operationOptions) {
      if (destroyed) {
        return
      }

      const key = resolveKey(name, operationOptions)
      const entry = key ? entries.get(key) : undefined
      if (!key || !entry) {
        return
      }

      current.set(key, entry.baselineValue)
      setDomValue(entry, entry.baselineValue)
    },

    resetAll() {
      if (destroyed) {
        return
      }

      for (const [key, entry] of entries) {
        current.set(key, entry.baselineValue)
        setDomValue(entry, entry.baselineValue)
      }
    },

    exportCss() {
      if (destroyed) {
        return ''
      }

      const exportableVars = getOrderedKeys(entries)
        .map((key) => {
          const entry = entries.get(key)
          const value = current.get(key)
          if (!entry || value === undefined) {
            return undefined
          }

          const validation = validateExportableValue(value)
          return validation.exportable ? { name: entry.name, scope: entry.scope, value: validation.normalizedValue } : undefined
        })
        .filter((item): item is { name: string; scope: string; value: string } => Boolean(item))

      return serializeCss(exportableVars)
    },

    exportJson() {
      if (destroyed) {
        return ''
      }

      const exportableVars = getOrderedKeys(entries)
        .map((key) => {
          const entry = entries.get(key)
          const value = current.get(key)
          if (!entry || value === undefined) {
            return undefined
          }

          const validation = validateExportableValue(value)
          return validation.exportable ? { name: entry.name, scope: entry.scope, value: validation.normalizedValue } : undefined
        })
        .filter((item): item is { name: string; scope: string; value: string } => Boolean(item))

      return serializeJson(exportableVars)
    },

    destroy() {
      if (destroyed) {
        return
      }

      destroyed = true
      current.clear()
      entries.clear()
    }
  }
}
