import type { CssVarsProductionGuard } from '../shared/types'

function isLocalHostname(hostname: string): boolean {
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1'
}

export function shouldBlockInCurrentEnvironment(mode: CssVarsProductionGuard = 'strict'): boolean {
  if (mode === 'off') {
    return false
  }

  if (typeof window === 'undefined') {
    return false
  }

  if (window.location.protocol === 'file:') {
    return false
  }

  return !isLocalHostname(window.location.hostname)
}
