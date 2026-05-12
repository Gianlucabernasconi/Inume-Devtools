function escapeCssValue(value: string): string {
  return value.replace(/[\r\n\f]+/g, ' ')
}

interface SerializableVar {
  name: string
  value: string
  scope?: string
}

export function serializeCss(vars: ReadonlyArray<SerializableVar>): string {
  if (vars.length === 0) {
    return ':root {\n}'
  }

  const grouped = groupByScope(vars)
  return [...grouped]
    .map(([scope, scopedVars]) => {
      const lines = scopedVars.map(({ name, value }) => `  ${name}: ${escapeCssValue(value)};`)
      return `${scope} {\n${lines.join('\n')}\n}`
    })
    .join('\n\n')
}

function groupByScope(vars: ReadonlyArray<SerializableVar>): Map<string, SerializableVar[]> {
  const grouped = new Map<string, SerializableVar[]>()

  for (const item of vars) {
    const scope = item.scope || ':root'
    grouped.set(scope, [...(grouped.get(scope) ?? []), item])
  }

  return grouped
}
