import { useEffect } from 'react'
import type { CssVarsDevtoolHandle, CssVarsDevtoolOptions } from './shared/types'

export function InumeDevtools(options: CssVarsDevtoolOptions): null {
  useEffect(() => {
    let handle: CssVarsDevtoolHandle | undefined
    let cancelled = false

    void import('inume-devtools/browser').then(({ mountCssVarsDevtool }) => {
      if (cancelled) {
        return
      }

      handle = mountCssVarsDevtool(options)
    })

    return () => {
      cancelled = true
      handle?.destroy()
    }
  }, [options])

  return null
}

export type { CssVarsDevtoolOptions } from './shared/types'
