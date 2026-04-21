export const STORAGE_SCHEMA_VERSION = 1

export interface PersistedPanelPosition {
  left: number
  top: number
}

export interface PersistedOverlayState {
  version: number
  vars: Record<string, string>
  panelPosition?: PersistedPanelPosition
}
