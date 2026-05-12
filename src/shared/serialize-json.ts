import { EXPORT_SCHEMA_VERSION } from './constants'

interface SerializableVar {
  name: string
  value: string
  scope?: string
}

export function serializeJson(vars: ReadonlyArray<SerializableVar>): string {
  const hasScopedVars = vars.some((item) => item.scope && item.scope !== ':root')
  const payload = hasScopedVars
    ? {
        version: EXPORT_SCHEMA_VERSION,
        scopes: Object.fromEntries(
          [...groupByScope(vars)].map(([scope, scopedVars]) => [scope, Object.fromEntries(scopedVars.map(({ name, value }) => [name, value]))])
        )
      }
    : {
        version: EXPORT_SCHEMA_VERSION,
        vars: Object.fromEntries(vars.map(({ name, value }) => [name, value]))
      }

  return JSON.stringify(payload, null, 2)
}

function groupByScope(vars: ReadonlyArray<SerializableVar>): Map<string, SerializableVar[]> {
  const grouped = new Map<string, SerializableVar[]>()

  for (const item of vars) {
    const scope = item.scope || ':root'
    grouped.set(scope, [...(grouped.get(scope) ?? []), item])
  }

  return grouped
}
