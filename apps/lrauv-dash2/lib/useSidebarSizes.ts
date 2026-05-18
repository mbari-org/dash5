import { useCallback, useState } from 'react'

const STORAGE_KEY = 'sidebar:rightPct'
const DEFAULT_SIZES: [number, number] = [75, 25]

/**
 * Persists the right-pane percentage of the Allotment split to localStorage
 * so the user's preferred sidebar width is restored across page navigations.
 *
 * Returns:
 *  - `defaultSizes`      — pass as the `defaultSizes` prop on <Allotment>
 *  - `onSidebarChange`   — pass as (or compose into) the `onChange` prop
 */
export function useSidebarSizes(): {
  defaultSizes: [number, number]
  onSidebarChange: (sizes: number[]) => void
} {
  const [defaultSizes] = useState<[number, number]>(() => {
    try {
      const stored =
        typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null
      if (stored) {
        const rightPct = parseFloat(stored)
        if (!isNaN(rightPct) && rightPct > 5 && rightPct < 95) {
          return [100 - rightPct, rightPct]
        }
      }
    } catch {
      // localStorage unavailable (SSR, private browsing)
    }
    return DEFAULT_SIZES
  })

  const onSidebarChange = useCallback((sizes: number[]) => {
    if (sizes.length < 2) return
    const total = sizes[0] + sizes[1]
    if (total <= 0) return
    const rightPct = (sizes[1] / total) * 100
    try {
      localStorage.setItem(STORAGE_KEY, rightPct.toFixed(2))
    } catch {
      // ignore storage failures
    }
  }, [])

  return { defaultSizes, onSidebarChange }
}
