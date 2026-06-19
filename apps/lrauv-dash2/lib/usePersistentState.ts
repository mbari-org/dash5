import { Dispatch, SetStateAction, useState } from 'react'

/**
 * Like useState, but reads/writes to sessionStorage so selections survive
 * component unmount/remount within the same browser session (e.g. tab switches,
 * accordion collapse/expand). Resets to initialValue when the tab is closed.
 *
 * The setter accepts both a plain value and a functional updater (SetStateAction<T>),
 * matching the full useState contract.
 */
export function usePersistentState<T>(
  key: string,
  initialValue: T
): [T, Dispatch<SetStateAction<T>>] {
  const [state, setState] = useState<T>(() => {
    try {
      const stored = sessionStorage.getItem(key)
      return stored !== null ? (JSON.parse(stored) as T) : initialValue
    } catch {
      return initialValue
    }
  })

  const setPersistentState: Dispatch<SetStateAction<T>> = (action) => {
    setState((prev) => {
      const next =
        typeof action === 'function' ? (action as (prev: T) => T)(prev) : action
      try {
        sessionStorage.setItem(key, JSON.stringify(next))
      } catch {
        // sessionStorage unavailable (e.g. private browsing with storage blocked)
      }
      return next
    })
  }

  return [state, setPersistentState]
}
