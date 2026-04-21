function normalizeCustomPropertyName(name: string): string | undefined {
  const trimmed = name.trim()

  if (!trimmed) {
    return undefined
  }

  if (trimmed.startsWith('--')) {
    return isSafeName(trimmed) ? trimmed : undefined
  }

  if (trimmed.startsWith('-')) {
    return undefined
  }

  const candidate = `--${trimmed}`
  return isSafeName(candidate) ? candidate : undefined
}

function isSafeName(name: string): boolean {
  return /^--[A-Za-z0-9_-]+$/.test(name)
}

export { normalizeCustomPropertyName }
