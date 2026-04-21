function escapeCssValue(value: string): string {
  return value.replace(/[\r\n\f]+/g, ' ')
}

export function serializeCss(vars: ReadonlyArray<{ name: string; value: string }>): string {
  if (vars.length === 0) {
    return ':root {\n}'
  }

  const lines = vars.map(({ name, value }) => `  ${name}: ${escapeCssValue(value)};`)
  return `:root {\n${lines.join('\n')}\n}`
}
