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

export type VehicleLeafPositions = Record<VehicleLeafKey, [number, number][]>

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
    (vehicleName: string): VehicleLeafState =>
      checkedState[vehicleName] ?? DEFAULT_LEAF_STATE,
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

  const toggleVehicle = useCallback((vehicleName: string) => {
    setCheckedState((prev) => {
      const current = prev[vehicleName] ?? DEFAULT_LEAF_STATE
      const counts = vehicleCountsRef.current[vehicleName]
      const visibleLeaves = ORDERED_LEAF_KEYS.filter(
        (leaf) =>
          !CONDITIONAL_LEAVES.includes(leaf) ||
          (counts?.[leaf as keyof typeof counts] ?? 0) > 0
      )
      const anyOn = visibleLeaves.some((k) => current[k])
      const updated = { ...current }
      if (anyOn) {
        // Any leaves on → turn everything off
        visibleLeaves.forEach((k) => {
          updated[k] = false
        })
      } else {
        // All off → turn on only the default-on leaves that are also visible
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
      const anyOn = vehicleNames.some((vn) => {
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
        if (anyOn) {
          visibleLeaves.forEach((k) => {
            updated[k] = false
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
