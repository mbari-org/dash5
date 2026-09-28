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
  | 'reachedWaypoints'
  | 'emergencies'

export type VehicleLeafState = Record<VehicleLeafKey, boolean>

export type LrauvsCheckedState = Record<string, VehicleLeafState>

export interface VehicleLeafCounts {
  gpsFixes: number
  argos: number
  reachedWaypoints: number
  emergencies: number
}

export type LrauvsCountsState = Record<string, VehicleLeafCounts>

const STORAGE_KEY = 'lrauvsCheckedState'

export const DEFAULT_LEAF_STATE: VehicleLeafState = {
  gpsFixes: true,
  waypoints: true,
  argos: false,
  reachedWaypoints: true,
  emergencies: true,
}

const ALL_LEAF_KEYS: VehicleLeafKey[] = [
  'gpsFixes',
  'waypoints',
  'argos',
  'reachedWaypoints',
  'emergencies',
]

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

  // In-memory only — populated by VehiclePath after data loads
  const [vehicleCounts, setVehicleCounts] = useState<LrauvsCountsState>({})

  // Persist checked state to localStorage on every change
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
      return checkedState[vehicleName] ?? DEFAULT_LEAF_STATE
    },
    [checkedState]
  )

  const isLeafChecked = useCallback(
    (vehicleName: string, leaf: VehicleLeafKey): boolean => {
      return getLeafState(vehicleName)[leaf]
    },
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

  const toggleVehicle = useCallback((vehicleName: string) => {
    setCheckedState((prev) => {
      const current = prev[vehicleName] ?? DEFAULT_LEAF_STATE
      // If all visible leaves are on, turn all off; otherwise turn all on.
      const allOn = ALL_LEAF_KEYS.every((k) => current[k])
      const next = Object.fromEntries(
        ALL_LEAF_KEYS.map((k) => [k, !allOn])
      ) as VehicleLeafState
      return { ...prev, [vehicleName]: next }
    })
  }, [])

  const toggleAll = useCallback((vehicleNames: string[]) => {
    setCheckedState((prev) => {
      const allOn = vehicleNames.every((vn) => {
        const state = prev[vn] ?? DEFAULT_LEAF_STATE
        return ALL_LEAF_KEYS.every((k) => state[k])
      })
      const next = { ...prev }
      vehicleNames.forEach((vn) => {
        next[vn] = Object.fromEntries(
          ALL_LEAF_KEYS.map((k) => [k, !allOn])
        ) as VehicleLeafState
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

  const value = useMemo(
    () => ({
      isLeafChecked,
      setLeafChecked,
      toggleLeaf,
      toggleVehicle,
      toggleAll,
      vehicleCounts,
      registerVehicleCounts,
    }),
    [
      isLeafChecked,
      setLeafChecked,
      toggleLeaf,
      toggleVehicle,
      toggleAll,
      vehicleCounts,
      registerVehicleCounts,
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
  })
  return context ?? noopRef.current
}
