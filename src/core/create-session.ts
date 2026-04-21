import { discoverVars } from './discover-vars'
import { normalizeCustomPropertyName } from '../shared/normalize-name'
import { serializeCss } from '../shared/serialize-css'
import { serializeJson } from '../shared/serialize-json'
import { validateExportableValue } from '../shared/validate-exportable-value'
import type { CssVarItem, CssVarsSession, CssVarsSessionOptions } from '../shared/types'

function toCssVarItem(name: string, value: string, baselineValue: string): CssVarItem {
  const validation = validateExportableValue(value)

  return {
    name,
    value,
    baselineValue,
    exportable: validation.exportable,
    editableAsColor: validation.editableAsColor
  }
}

function getOrderedNames(values: Map<string, string>): string[] {
  return [...values.keys()].sort((left, right) => left.localeCompare(right))
}

export function createCssVarsSession(options: CssVarsSessionOptions = {}): CssVarsSession {
  const { target, baseline } = discoverVars(options)
  const current = new Map(baseline)
  const allowRaw = options.allowRaw === true
  let destroyed = false

  function setDomValue(name: string, value: string): void {
    target.documentElement.style.setProperty(name, value)
  }

  function getItem(name: string): CssVarItem | undefined {
    const value = current.get(name)
    const baselineValue = baseline.get(name)

    if (value === undefined || baselineValue === undefined) {
      return undefined
    }

    return toCssVarItem(name, value, baselineValue)
  }

  return {
    getVars() {
      if (destroyed) {
        return []
      }

      return getOrderedNames(current)
        .map((name) => getItem(name))
        .filter((item): item is CssVarItem => Boolean(item))
    },

    getVar(name) {
      if (destroyed) {
        return undefined
      }

      const normalizedName = normalizeCustomPropertyName(name)
      return normalizedName ? getItem(normalizedName) : undefined
    },

    setVar(name, value) {
      if (destroyed) {
        return
      }

      const normalizedName = normalizeCustomPropertyName(name)
      if (!normalizedName || !current.has(normalizedName)) {
        return
      }

      const validation = validateExportableValue(value)
      if (!allowRaw && !validation.exportable) {
        return
      }

      current.set(normalizedName, validation.normalizedValue)
      setDomValue(normalizedName, validation.normalizedValue)
    },

    resetVar(name) {
      if (destroyed) {
        return
      }

      const normalizedName = normalizeCustomPropertyName(name)
      if (!normalizedName) {
        return
      }

      const baselineValue = baseline.get(normalizedName)
      if (baselineValue === undefined) {
        return
      }

      current.set(normalizedName, baselineValue)
      setDomValue(normalizedName, baselineValue)
    },

    resetAll() {
      if (destroyed) {
        return
      }

      for (const [name, baselineValue] of baseline) {
        current.set(name, baselineValue)
        setDomValue(name, baselineValue)
      }
    },

    exportCss() {
      if (destroyed) {
        return ''
      }

      const exportableVars = getOrderedNames(current)
        .map((name) => {
          const value = current.get(name)
          if (value === undefined) {
            return undefined
          }

          const validation = validateExportableValue(value)
          return validation.exportable ? { name, value: validation.normalizedValue } : undefined
        })
        .filter((item): item is { name: string; value: string } => Boolean(item))

      return serializeCss(exportableVars)
    },

    exportJson() {
      if (destroyed) {
        return ''
      }

      const exportableVars = getOrderedNames(current)
        .map((name) => {
          const value = current.get(name)
          if (value === undefined) {
            return undefined
          }

          const validation = validateExportableValue(value)
          return validation.exportable ? { name, value: validation.normalizedValue } : undefined
        })
        .filter((item): item is { name: string; value: string } => Boolean(item))

      return serializeJson(exportableVars)
    },

    destroy() {
      if (destroyed) {
        return
      }

      destroyed = true
      baseline.clear()
      current.clear()
    }
  }
}
