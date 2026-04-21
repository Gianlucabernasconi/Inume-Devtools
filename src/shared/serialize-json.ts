import { EXPORT_SCHEMA_VERSION } from './constants'

export function serializeJson(vars: ReadonlyArray<{ name: string; value: string }>): string {
  const payload = {
    version: EXPORT_SCHEMA_VERSION,
    vars: Object.fromEntries(vars.map(({ name, value }) => [name, value]))
  }

  return JSON.stringify(payload, null, 2)
}
