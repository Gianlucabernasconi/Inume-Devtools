import { normalizeCustomPropertyName } from '../shared/normalize-name'
import type { CssVarsSessionOptions } from '../shared/types'

interface ResolvedFilters {
  prefixes?: string[]
  include: Set<string>
  exclude: Set<string>
  match?: (name: string) => boolean
}

function normalizePrefix(prefix: string): string | undefined {
  const trimmed = prefix.trim()

  if (!trimmed) {
    return undefined
  }

  if (trimmed.startsWith('--')) {
    return trimmed
  }

  if (trimmed.startsWith('-')) {
    return undefined
  }

  return `--${trimmed}`
}

function toNormalizedSet(values: string[] | undefined): Set<string> {
  const result = new Set<string>()

  for (const value of values ?? []) {
    const normalized = normalizeCustomPropertyName(value)
    if (normalized) {
      result.add(normalized)
    }
  }

  return result
}

export function resolveFilters(options: CssVarsSessionOptions): ResolvedFilters {
  const prefixes = options.prefixes
    ?.map(normalizePrefix)
    .filter((prefix): prefix is string => Boolean(prefix))

  return {
    prefixes,
    include: toNormalizedSet(options.include),
    exclude: toNormalizedSet(options.exclude),
    match: options.match
  }
}

export function shouldIncludeName(name: string, filters: ResolvedFilters): boolean {
  const includedByPrefix = filters.prefixes ? filters.prefixes.some((prefix) => name.startsWith(prefix)) : true
  const included = includedByPrefix || filters.include.has(name)

  if (!included) {
    return false
  }

  if (filters.exclude.has(name)) {
    return false
  }

  if (!filters.match) {
    return true
  }

  return filters.match(name)
}
