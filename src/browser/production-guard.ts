import type { CssVarsProductionGuard } from '../shared/types'

function isLocalHostname(hostname: string): boolean {
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1'
}

export interface ProductionGuardDecision {
  blocked: boolean
  shouldWarn: boolean
  warningMessage?: string
}

export function getProductionGuardDecision(
  mode: CssVarsProductionGuard = 'strict',
  currentWindow?: Window
): ProductionGuardDecision {
  if (mode === 'off') {
    return {
      blocked: false,
      shouldWarn: false
    }
  }

  if (!currentWindow) {
    return {
      blocked: false,
      shouldWarn: false
    }
  }

  if (currentWindow.location.protocol === 'file:') {
    return {
      blocked: false,
      shouldWarn: false
    }
  }

  const isLocal = isLocalHostname(currentWindow.location.hostname)
  const warningMessage =
    '[css-vars-devtools] productionGuard activo fuera de loopback local. Mantener el import dinamico solo en desarrollo sigue siendo obligatorio.'

  if (mode === 'warn') {
    return {
      blocked: false,
      shouldWarn: !isLocal,
      warningMessage: !isLocal ? warningMessage : undefined
    }
  }

  return {
    blocked: !isLocal,
    shouldWarn: false
  }
}

export function shouldBlockInCurrentEnvironment(mode: CssVarsProductionGuard = 'strict'): boolean {
  return getProductionGuardDecision(mode, typeof window === 'undefined' ? undefined : window).blocked
}
