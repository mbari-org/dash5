import { Dispatch, SetStateAction, useLayoutEffect, useState } from 'react'

/**
 * Like useState, but reads/writes to sessionStorage so selections survive
 * component unmount/remount within the same browser session (e.g. tab switches,
 * accordion collapse/expand). Resets to initialValue when the tab is closed.
 *
 * The setter accepts both a plain value and a functional updater (SetStateAction<T>),
 * matching the full useState contract.
 *
 * SSR safety: the initial render (server + first client render) uses initialValue
 * so the hydrated HTML matches the server output. sessionStorage is read in
 * useLayoutEffect, which runs only on the client after mount and before paint,
 * avoiding React hydration mismatch warnings.
 */
export function usePersistentState<T>(
  key: string,
  initialValue: T
): [T, Dispatch<SetStateAction<T>>] {
  const [state, setState] = useState<T>(initialValue)

  // Hydrate from sessionStorage after mount (client-only). useLayoutEffect
  // runs synchronously before the browser paints, so there is no visible flash.
  useLayoutEffect(() => {
    try {
      const stored = sessionStorage.getItem(key)
      if (stored !== null) {
        setState(JSON.parse(stored) as T)
      }
    } catch {
      // sessionStorage unavailable (e.g. private browsing with storage blocked)
    }
  }, [key])

  const setPersistentState: Dispatch<SetStateAction<T>> = (action) => {
    setState((prev) => {
      const next =
        typeof action === 'function' ? (action as (prev: T) => T)(prev) : action
      try {
        sessionStorage.setItem(key, JSON.stringify(next))
      } catch {
        // sessionStorage unavailable
      }
      return next
    })
  }

  return [state, setPersistentState]
}
