import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useLayoutEffect,
  useState,
} from 'react'

// In Next.js server environments useLayoutEffect emits a warning.
// This isomorphic variant uses useLayoutEffect on the client (runs before
// paint, no visible flash) and useEffect on the server (no-op during SSR).
const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect

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

  // Hydrate from sessionStorage after mount (client-only). Runs synchronously
  // before the browser paints on the client so there is no visible flash.
  useIsomorphicLayoutEffect(() => {
    try {
      const stored = sessionStorage.getItem(key)
      if (stored !== null) {
        setState(JSON.parse(stored) as T)
      } else {
        // No stored value for this key — reset to initialValue so that stale
        // state from a previous key (e.g. per-vehicle/deployment parameterized
        // keys) doesn't linger after a key change.
        setState(initialValue)
      }
    } catch {
      // Corrupted or outdated value — remove it and reset to initialValue so
      // future mounts hydrate cleanly rather than retrying the same bad data.
      try {
        sessionStorage.removeItem(key)
      } catch {
        // sessionStorage unavailable (e.g. private browsing with storage blocked)
      }
      setState(initialValue)
    }
    // initialValue is included so the hook resets when the caller's default
    // changes alongside a key change. Callers should use stable primitives
    // (strings, booleans, null) as initialValue to avoid unnecessary re-runs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, initialValue])

  // Memoize so the setter identity is stable across renders. Callers that
  // include the setter in effect dependency arrays (e.g. ScienceDataSection,
  // DepthSection) won't re-run unnecessarily when the parent re-renders.
  const setPersistentState = useCallback<Dispatch<SetStateAction<T>>>(
    (action) => {
      setState((prev) => {
        const next =
          typeof action === 'function'
            ? (action as (prev: T) => T)(prev)
            : action
        try {
          if (next === undefined) {
            sessionStorage.removeItem(key)
          } else {
            sessionStorage.setItem(key, JSON.stringify(next))
          }
        } catch {
          // sessionStorage unavailable
        }
        return next
      })
    },
    [key] // setState from useState is stable; key is the only meaningful dep
  )

  return [state, setPersistentState]
}
