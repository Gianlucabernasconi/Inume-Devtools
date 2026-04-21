import { normalizeColorValue } from './normalize-color'
import type { CssVarValidationResult } from './types'

const HEX_PATTERN = /^#(?:[\da-f]{3}|[\da-f]{4}|[\da-f]{6}|[\da-f]{8})$/i
const SAFE_FUNC_NAME_PATTERN = /^(rgb|rgba|hsl|hsla)\(/i

function hasUnsafeTokens(value: string): boolean {
  const lower = value.toLowerCase()

  return (
    lower.includes('url(') ||
    lower.includes('expression(') ||
    lower.includes('@') ||
    lower.includes(';') ||
    lower.includes('/*') ||
    lower.includes('*/')
  )
}

function isBalancedFunctionValue(value: string): boolean {
  let depth = 0

  for (const char of value) {
    if (char === '(') {
      depth += 1
      continue
    }

    if (char === ')') {
      depth -= 1
      if (depth < 0) {
        return false
      }
    }
  }

  return depth === 0
}

function isSupportedFunctionalColor(value: string): boolean {
  if (!SAFE_FUNC_NAME_PATTERN.test(value)) {
    return false
  }

  if (!isBalancedFunctionValue(value)) {
    return false
  }

  const compact = value.replace(/\s+/g, ' ').trim()
  return /^[A-Za-z]+\((?:[^()]|\/(?!\*)|,(?!\*)|\s)+\)$/.test(compact)
}

export function validateExportableValue(value: string): CssVarValidationResult {
  const normalizedValue = normalizeColorValue(value)

  if (!normalizedValue || hasUnsafeTokens(normalizedValue)) {
    return {
      normalizedValue,
      exportable: false,
      editableAsColor: false
    }
  }

  if (HEX_PATTERN.test(normalizedValue)) {
    return {
      normalizedValue,
      exportable: true,
      editableAsColor: true
    }
  }

  if (isSupportedFunctionalColor(normalizedValue)) {
    return {
      normalizedValue,
      exportable: true,
      editableAsColor: true
    }
  }

  return {
    normalizedValue,
    exportable: false,
    editableAsColor: false
  }
}
