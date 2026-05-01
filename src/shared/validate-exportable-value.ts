import { normalizeColorValue } from './normalize-color'
import type { CssVarValidationResult } from './types'

const HEX_PATTERN = /^#(?:[\da-f]{3}|[\da-f]{4}|[\da-f]{6}|[\da-f]{8})$/i
const FUNCTION_COLOR_PATTERN = /^(rgb|rgba|hsl|hsla)\((.*)\)$/i

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
  const match = value.match(FUNCTION_COLOR_PATTERN)
  if (!match) {
    return false
  }

  if (!isBalancedFunctionValue(value)) {
    return false
  }

  const functionName = match[1]?.toLowerCase()
  const args = match[2]?.replace(/\s+/g, ' ').trim()
  if (!functionName || !args) {
    return false
  }

  return functionName.startsWith('rgb') ? isRgbLike(args) : isHslLike(args)
}

function isRgbLike(args: string): boolean {
  const { channels, alpha } = splitColorFunctionArgs(args)
  if (channels.length !== 3) {
    return false
  }

  return channels.every(isRgbChannel) && (alpha === undefined || isAlpha(alpha))
}

function isHslLike(args: string): boolean {
  const { channels, alpha } = splitColorFunctionArgs(args)
  if (channels.length !== 3) {
    return false
  }

  const [hue, saturation, lightness] = channels
  return Boolean(hue && saturation && lightness && isHue(hue) && isPercentage(saturation) && isPercentage(lightness) && (alpha === undefined || isAlpha(alpha)))
}

function splitColorFunctionArgs(args: string): { channels: string[]; alpha?: string } {
  const separator = args.includes(',') ? ',' : ' '
  const [channelPart = '', alphaPart] = args.split('/').map((part) => part.trim())
  const channels = channelPart
    .split(separator)
    .map((part) => part.trim())
    .filter(Boolean)

  const alpha = alphaPart || (separator === ',' && channels.length === 4 ? channels.pop() : undefined)

  return {
    channels,
    alpha
  }
}

function isRgbChannel(value: string): boolean {
  if (value.endsWith('%')) {
    return isNumberInRange(value.slice(0, -1), 0, 100)
  }

  return isNumberInRange(value, 0, 255)
}

function isHue(value: string): boolean {
  return /^-?\d+(?:\.\d+)?(?:deg|rad|grad|turn)?$/i.test(value)
}

function isPercentage(value: string): boolean {
  return value.endsWith('%') && isNumberInRange(value.slice(0, -1), 0, 100)
}

function isAlpha(value: string): boolean {
  if (value.endsWith('%')) {
    return isNumberInRange(value.slice(0, -1), 0, 100)
  }

  return isNumberInRange(value, 0, 1)
}

function isNumberInRange(value: string, min: number, max: number): boolean {
  if (!/^-?\d+(?:\.\d+)?$/.test(value)) {
    return false
  }

  const numericValue = Number(value)
  return Number.isFinite(numericValue) && numericValue >= min && numericValue <= max
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
