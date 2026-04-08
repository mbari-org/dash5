import { useState, useEffect } from 'react'

const readNames = (storageKey: string): string[] => {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem(storageKey)
    const parsed = stored ? JSON.parse(stored) : []
    return Array.isArray(parsed)
      ? parsed.filter((value): value is string => typeof value === 'string')
      : []
  } catch {
    return []
  }
}

/**
 * Manages a string[] state that is persisted to localStorage and kept in sync
 * across browser tabs (storage event) and tab re-focuses (visibilitychange).
 * Identical logic is used by SelectedPolygonsContext, SelectedTileLayersContext,
 * and SelectedKmlLayersContext — this hook centralises it so behaviour changes
 * (e.g. cross-tab sync) are applied consistently.
 */
export const useSelectedNamesState = (storageKey: string) => {
  const [selectedNames, setSelectedNames] = useState<string[]>(() =>
    readNames(storageKey)
  )

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const serialized = JSON.stringify(selectedNames)
      if (localStorage.getItem(storageKey) === serialized) return
      localStorage.setItem(storageKey, serialized)
    } catch {
      // Ignore storage failures so persistence issues do not crash the UI.
    }
  }, [storageKey, selectedNames])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleStorage = (e: StorageEvent) => {
      if (e.key !== storageKey) return
      setSelectedNames(readNames(storageKey))
    }

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        const next = readNames(storageKey)
        setSelectedNames((cur) =>
          JSON.stringify(cur) === JSON.stringify(next) ? cur : next
        )
      }
    }

    window.addEventListener('storage', handleStorage)
    document.addEventListener('visibilitychange', handleVisibility)
    return () => {
      window.removeEventListener('storage', handleStorage)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [storageKey])

  return [selectedNames, setSelectedNames] as const
}
