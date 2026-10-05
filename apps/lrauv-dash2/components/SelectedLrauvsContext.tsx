import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

export type VehicleLeafKey =
  | 'gpsFixes'
  | 'waypoints'
  | 'argos'
  | 'navigatingToWaypoints'
  | 'reachedWaypoints'
  | 'emergencies'

export type VehicleLeafState = Record<VehicleLeafKey, boolean>

export type LrauvsCheckedState = Record<string, VehicleLeafState>

export interface VehicleLeafCounts {
  gpsFixes: number
  argos: number
  navigatingToWaypoints: number
  reachedWaypoints: number
  emergencies: number
}

export type LrauvsCountsState = Record<string, VehicleLeafCounts>

/** Vehicle name sentinel used to represent the LRAUVs root row on hover. */
export const LRAUVS_ROOT_HOVER = '__ALL__'

export interface LrauvsHoverState {
  /** Vehicle name, or LRAUVS_ROOT_HOVER for the root row. */
  vehicleName: string | null
  /** Which leaf is hovered; null means vehicle row or root row. */
  leaf: VehicleLeafKey | null
}

const STORAGE_KEY = 'lrauvsCheckedState'

// Leaves shown only when their count > 0 (Dash4 parity)
export const CONDITIONAL_LEAVES: VehicleLeafKey[] = [
  'argos',
  'navigatingToWaypoints',
  'reachedWaypoints',
  'emergencies',
]

export const DEFAULT_LEAF_STATE: VehicleLeafState = {
  gpsFixes: false,
  waypoints: false,
  argos: false,
  navigatingToWaypoints: false,
  reachedWaypoints: false,
  emergencies: false,
}

// Leaves that turn ON automatically when a vehicle row is first checked.
// Argos and Navigating to WPs are intentionally excluded — they are noisy
// and must be explicitly enabled by the operator.
export const DEFAULT_ON_LEAVES: VehicleLeafKey[] = [
  'gpsFixes',
  'waypoints',
  'reachedWaypoints',
  'emergencies',
]

// Ordered to match Dash4: GPS fixes → Waypoints → Argos → N2WPs → Reached WPs → Emergencies
export const ORDERED_LEAF_KEYS: VehicleLeafKey[] = [
  'gpsFixes',
  'waypoints',
  'argos',
  'navigatingToWaypoints',
  'reachedWaypoints',
  'emergencies',
]

export type VehicleLeafPositions = Record<
  VehicleLeafKey,
  [number, number][]
> & {
  /** Vehicle dot marker position — the same point VehiclePath uses to render
   *  the vehicle's current location on the map. Always set when the vehicle
   *  has any known position (including docked vehicles with no active fixes). */
  markerPosition?: [number, number]
}

export interface SelectedLrauvsContextProps {
  isLeafChecked: (vehicleName: string, leaf: VehicleLeafKey) => boolean
  setLeafChecked: (
    vehicleName: string,
    leaf: VehicleLeafKey,
    value: boolean
  ) => void
  toggleLeaf: (vehicleName: string, leaf: VehicleLeafKey) => void
  toggleVehicle: (vehicleName: string) => void
  toggleAll: (vehicleNames: string[]) => void
  vehicleCounts: LrauvsCountsState
  registerVehicleCounts: (
    vehicleName: string,
    counts: VehicleLeafCounts
  ) => void
  hoverState: LrauvsHoverState
  setHover: (vehicleName: string, leaf: VehicleLeafKey | null) => void
  clearHover: () => void
  /** Register per-vehicle per-leaf position arrays. Stored in a ref so
   *  updates do not trigger re-renders. Used by LrauvsLayerSection for
   *  the center-on-layer buttons. */
  registerVehiclePositions: (
    vehicleName: string,
    positions: VehicleLeafPositions
  ) => void
  getVehicleLeafPositions: (
    vehicleName: string
  ) => VehicleLeafPositions | undefined
}

const SelectedLrauvsContext = createContext<
  SelectedLrauvsContextProps | undefined
>(undefined)

export const SelectedLrauvsProvider: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  const [checkedState, setCheckedState] = useState<LrauvsCheckedState>(() => {
    if (typeof window === 'undefined') return {}
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      const parsed = stored ? JSON.parse(stored) : {}
      return typeof parsed === 'object' && parsed !== null ? parsed : {}
    } catch {
      return {}
    }
  })

  const [vehicleCounts, setVehicleCounts] = useState<LrauvsCountsState>({})

  const [hoverState, setHoverState] = useState<LrauvsHoverState>({
    vehicleName: null,
    leaf: null,
  })

  // Stored as a ref so position updates don't re-render the tree.
  const vehiclePositionsRef = useRef<Record<string, VehicleLeafPositions>>({})

  const registerVehiclePositions = useCallback(
    (vehicleName: string, positions: VehicleLeafPositions) => {
      vehiclePositionsRef.current[vehicleName] = positions
    },
    []
  )

  const getVehicleLeafPositions = useCallback(
    (vehicleName: string): VehicleLeafPositions | undefined =>
      vehiclePositionsRef.current[vehicleName],
    []
  )

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(checkedState))
    } catch {
      // storage unavailable
    }
  }, [checkedState])

  const getLeafState = useCallback(
    (vehicleName: string): VehicleLeafState => {
      if (checkedState[vehicleName] !== undefined)
        return checkedState[vehicleName]
      // No saved entry yet — return default-on state so overlays are visible
      // on the first paint (Dash4 parity). registerVehicleCounts will write
      // the real seeds once data arrives, but non-conditional leaves should
      // never flash off on cache hits.
      const firstPaint = { ...DEFAULT_LEAF_STATE }
      DEFAULT_ON_LEAVES.forEach((k) => {
        if (!CONDITIONAL_LEAVES.includes(k)) firstPaint[k] = true
      })
      return firstPaint
    },
    [checkedState]
  )

  const isLeafChecked = useCallback(
    (vehicleName: string, leaf: VehicleLeafKey): boolean =>
      getLeafState(vehicleName)[leaf],
    [getLeafState]
  )

  const setLeafChecked = useCallback(
    (vehicleName: string, leaf: VehicleLeafKey, value: boolean) => {
      setCheckedState((prev) => ({
        ...prev,
        [vehicleName]: {
          ...(prev[vehicleName] ?? DEFAULT_LEAF_STATE),
          [leaf]: value,
        },
      }))
    },
    []
  )

  const toggleLeaf = useCallback(
    (vehicleName: string, leaf: VehicleLeafKey) => {
      setCheckedState((prev) => {
        const current = prev[vehicleName] ?? DEFAULT_LEAF_STATE
        return {
          ...prev,
          [vehicleName]: { ...current, [leaf]: !current[leaf] },
        }
      })
    },
    []
  )

  const vehicleCountsRef = useRef(vehicleCounts)
  vehicleCountsRef.current = vehicleCounts

  // Tracks which vehicles have been registered at least once this session.
  // Used to distinguish a truly-new vehicle from a persisted-from-localStorage
  // vehicle on its first registerVehicleCounts call (when vehicleCountsRef is
  // still empty), so we don't accidentally re-enable a leaf the operator
  // previously unchecked.
  const registeredVehiclesRef = useRef<Set<string>>(new Set())

  const toggleVehicle = useCallback((vehicleName: string) => {
    setCheckedState((prev) => {
      const current = prev[vehicleName] ?? DEFAULT_LEAF_STATE
      const counts = vehicleCountsRef.current[vehicleName]
      const visibleLeaves = ORDERED_LEAF_KEYS.filter(
        (leaf) =>
          !CONDITIONAL_LEAVES.includes(leaf) ||
          (counts?.[leaf as keyof typeof counts] ?? 0) > 0
      )
      // Three-state toggle matching standard indeterminate checkbox behaviour:
      //   All on  → all off
      //   Mixed   → all on  (operator sees fully-selected state after one click)
      //   All off → default-on leaves on (first-use default)
      const allOn = visibleLeaves.every((k) => current[k])
      const someOn = visibleLeaves.some((k) => current[k])
      const updated = { ...current }
      if (allOn) {
        // All leaves on → turn everything off
        visibleLeaves.forEach((k) => {
          updated[k] = false
        })
      } else if (someOn) {
        // Mixed (indeterminate) → turn ALL visible leaves on
        visibleLeaves.forEach((k) => {
          updated[k] = true
        })
      } else {
        // All off → restore default-on leaves that are visible
        DEFAULT_ON_LEAVES.forEach((k) => {
          if (visibleLeaves.includes(k)) updated[k] = true
        })
      }
      return { ...prev, [vehicleName]: updated }
    })
  }, [])

  const toggleAll = useCallback((vehicleNames: string[]) => {
    setCheckedState((prev) => {
      const counts = vehicleCountsRef.current
      // Three-state toggle: all on → all off; mixed → all on; all off → defaults.
      const allOn = vehicleNames.every((vn) => {
        const state = prev[vn] ?? DEFAULT_LEAF_STATE
        const vCounts = counts[vn]
        const visibleLeaves = ORDERED_LEAF_KEYS.filter(
          (leaf) =>
            !CONDITIONAL_LEAVES.includes(leaf) ||
            (vCounts?.[leaf as keyof typeof vCounts] ?? 0) > 0
        )
        return visibleLeaves.every((k) => state[k])
      })
      const someOn = vehicleNames.some((vn) => {
        const state = prev[vn] ?? DEFAULT_LEAF_STATE
        const vCounts = counts[vn]
        const visibleLeaves = ORDERED_LEAF_KEYS.filter(
          (leaf) =>
            !CONDITIONAL_LEAVES.includes(leaf) ||
            (vCounts?.[leaf as keyof typeof vCounts] ?? 0) > 0
        )
        return visibleLeaves.some((k) => state[k])
      })
      const next = { ...prev }
      vehicleNames.forEach((vn) => {
        const vCounts = counts[vn]
        const visibleLeaves = ORDERED_LEAF_KEYS.filter(
          (leaf) =>
            !CONDITIONAL_LEAVES.includes(leaf) ||
            (vCounts?.[leaf as keyof typeof vCounts] ?? 0) > 0
        )
        const current = next[vn] ?? DEFAULT_LEAF_STATE
        const updated = { ...current }
        if (allOn) {
          visibleLeaves.forEach((k) => {
            updated[k] = false
          })
        } else if (someOn) {
          // Mixed → select all
          visibleLeaves.forEach((k) => {
            updated[k] = true
          })
        } else {
          DEFAULT_ON_LEAVES.forEach((k) => {
            if (visibleLeaves.includes(k)) updated[k] = true
          })
        }
        next[vn] = updated as VehicleLeafState
      })
      return next
    })
  }, [])

  const registerVehicleCounts = useCallback(
    (vehicleName: string, counts: VehicleLeafCounts) => {
      // Seed default-on leaves the first time a vehicle is registered, and
      // also turn on any DEFAULT_ON_LEAVES conditional leaf the moment it
      // gets its first data point (e.g. first emergency arrives mid-deployment).
      const isFirstRegistration =
        !registeredVehiclesRef.current.has(vehicleName)
      registeredVehiclesRef.current.add(vehicleName)

      setCheckedState((prev) => {
        const isNew = prev[vehicleName] === undefined
        const current = prev[vehicleName] ?? DEFAULT_LEAF_STATE
        const seed = { ...current }
        let changed = isNew

        DEFAULT_ON_LEAVES.forEach((k) => {
          if (!CONDITIONAL_LEAVES.includes(k)) {
            // Non-conditional leaf: only set on the very first registration.
            if (isNew) seed[k] = true
          } else {
            // Conditional leaf: turn on the first time it has data,
            // but never force it back off once the operator unchecks it.
            //
            // For a persisted vehicle (isNew=false), vehicleCountsRef is still
            // empty on the first registerVehicleCounts call this session, so
            // hadData would wrongly be false — causing a previously-unchecked
            // leaf to be re-enabled as soon as data arrives. Treat the first
            // registration of a persisted vehicle as "had data" so the
            // auto-enable is skipped; subsequent calls use the real count.
            const hadData = isNew
              ? false
              : isFirstRegistration
              ? true
              : (vehicleCountsRef.current[vehicleName]?.[
                  k as keyof VehicleLeafCounts
                ] ?? 0) > 0
            const nowHasData = (counts[k as keyof typeof counts] ?? 0) > 0
            if (!hadData && nowHasData && !current[k]) {
              seed[k] = true
              changed = true
            } else if (isNew && nowHasData) {
              seed[k] = true
              changed = true
            }
          }
        })

        return changed ? { ...prev, [vehicleName]: seed } : prev
      })
      setVehicleCounts((prev) => {
        const existing = prev[vehicleName]
        if (
          existing &&
          existing.gpsFixes === counts.gpsFixes &&
          existing.argos === counts.argos &&
          existing.navigatingToWaypoints === counts.navigatingToWaypoints &&
          existing.reachedWaypoints === counts.reachedWaypoints &&
          existing.emergencies === counts.emergencies
        ) {
          return prev
        }
        return { ...prev, [vehicleName]: counts }
      })
    },
    []
  )

  const setHover = useCallback(
    (vehicleName: string, leaf: VehicleLeafKey | null) => {
      setHoverState({ vehicleName, leaf })
    },
    []
  )

  const clearHover = useCallback(() => {
    setHoverState({ vehicleName: null, leaf: null })
  }, [])

  const value = useMemo(
    () => ({
      isLeafChecked,
      setLeafChecked,
      toggleLeaf,
      toggleVehicle,
      toggleAll,
      vehicleCounts,
      registerVehicleCounts,
      hoverState,
      setHover,
      clearHover,
      registerVehiclePositions,
      getVehicleLeafPositions,
    }),
    [
      isLeafChecked,
      setLeafChecked,
      toggleLeaf,
      toggleVehicle,
      toggleAll,
      vehicleCounts,
      registerVehicleCounts,
      hoverState,
      setHover,
      clearHover,
      registerVehiclePositions,
      getVehicleLeafPositions,
    ]
  )

  return (
    <SelectedLrauvsContext.Provider value={value}>
      {children}
    </SelectedLrauvsContext.Provider>
  )
}

export const useSelectedLrauvs = (): SelectedLrauvsContextProps => {
  const context = useContext(SelectedLrauvsContext)
  if (!context) {
    throw new Error(
      'useSelectedLrauvs must be used within a SelectedLrauvsProvider'
    )
  }
  return context
}

const NO_OP_HOVER: LrauvsHoverState = { vehicleName: null, leaf: null }

/** Safe version — returns all-visible defaults when no provider is present.
 *  Used in VehiclePath so the vehicle detail page (no layers modal) is unaffected. */
export const useSelectedLrauvsOptional = (): SelectedLrauvsContextProps => {
  const context = useContext(SelectedLrauvsContext)
  const noopRef = useRef<SelectedLrauvsContextProps>({
    isLeafChecked: () => true,
    setLeafChecked: () => undefined,
    toggleLeaf: () => undefined,
    toggleVehicle: () => undefined,
    toggleAll: () => undefined,
    vehicleCounts: {},
    registerVehicleCounts: () => undefined,
    hoverState: NO_OP_HOVER,
    setHover: () => undefined,
    clearHover: () => undefined,
    registerVehiclePositions: () => undefined,
    getVehicleLeafPositions: () => undefined,
  })
  return context ?? noopRef.current
}
