import { useState } from 'react'

/**
 * Like useState, but reads/writes to sessionStorage so selections survive
 * component unmount/remount within the same browser session (e.g. tab switches,
 * accordion collapse/expand). Resets to initialValue when the tab is closed.
 */
export function usePersistentState<T>(
  key: string,
  initialValue: T
): [T, (value: T) => void] {
  const [state, setState] = useState<T>(() => {
    try {
      const stored = sessionStorage.getItem(key)
      return stored !== null ? (JSON.parse(stored) as T) : initialValue
    } catch {
      return initialValue
    }
  })

  const setPersistentState = (value: T) => {
    setState(value)
    try {
      sessionStorage.setItem(key, JSON.stringify(value))
    } catch {
      // sessionStorage unavailable (e.g. private browsing with storage blocked)
    }
  }

  return [state, setPersistentState]
}
