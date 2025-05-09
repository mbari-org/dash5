import React, {
  createContext,
  useContext,
  useMemo,
  ReactNode,
  useState,
} from 'react'
import { ScheduleMethod, CommType } from '../ScheduleStep'

export interface ScheduleState {
  alternateAddress: string | null
  confirmedVehicle: string | null
  showAlternateAddress: boolean
  scheduleMethod: ScheduleMethod
  customScheduleId: string | null
  notes: string | null
  specifiedTime: string | null
  commType: CommType
  timeout: number | undefined
}

export interface ScheduleActions {
  setAlternateAddress: (v: string | null) => void
  setConfirmedVehicle: (v: string | null) => void
  setShowAlternateAddress: (v: boolean) => void
  setScheduleMethod: (v: ScheduleMethod) => void
  setCustomScheduleId: (v: string | null) => void
  setNotes: (v: string | null) => void
  setSpecifiedTime: (v: string | null) => void
  setCommType: (v: CommType) => void
  setTimeout: (v: number | undefined) => void
}

type ScheduleContextType = { state: ScheduleState; actions: ScheduleActions }

const ScheduleContext = createContext<ScheduleContextType | undefined>(
  undefined
)

function useScheduleState(
  initial?: Partial<ScheduleState>
): ScheduleContextType {
  const [alternateAddress, setAlternateAddress] = useState(
    initial?.alternateAddress ?? null
  )
  const [confirmedVehicle, setConfirmedVehicle] = useState(
    initial?.confirmedVehicle ?? null
  )
  const [showAlternateAddress, setShowAlternateAddress] = useState(
    initial?.showAlternateAddress ?? false
  )
  const [scheduleMethod, setScheduleMethod] = useState<ScheduleMethod>(
    initial?.scheduleMethod ?? 'ASAP'
  )
  const [customScheduleId, setCustomScheduleId] = useState<string | null>(
    initial?.customScheduleId ?? null
  )
  const [notes, setNotes] = useState<string | null>(initial?.notes ?? null)
  const [specifiedTime, setSpecifiedTime] = useState<string | null>(
    initial?.specifiedTime ?? null
  )
  const [commType, setCommType] = useState<CommType>(
    initial?.commType ?? 'cellsat'
  )
  const [timeout, setTimeout] = useState<number | undefined>(
    initial?.timeout ?? 5
  )

  const state: ScheduleState = {
    alternateAddress,
    confirmedVehicle,
    showAlternateAddress,
    scheduleMethod,
    customScheduleId,
    notes,
    specifiedTime,
    commType,
    timeout,
  }

  const actions: ScheduleActions = {
    setAlternateAddress,
    setConfirmedVehicle,
    setShowAlternateAddress,
    setScheduleMethod,
    setCustomScheduleId,
    setNotes,
    setSpecifiedTime,
    setCommType,
    setTimeout,
  }

  return { state, actions }
}

export interface ScheduleProviderProps {
  children: ReactNode
  initialState?: Partial<ScheduleState>
}

export const ScheduleProvider: React.FC<ScheduleProviderProps> = ({
  children,
  initialState,
}) => {
  const { state, actions } = useScheduleState(initialState)

  const value = useMemo(() => ({ state, actions }), [state, actions])

  return (
    <ScheduleContext.Provider value={value}>
      {children}
    </ScheduleContext.Provider>
  )
}

export function useScheduleContext(): ScheduleContextType {
  const ctx = useContext(ScheduleContext)
  if (!ctx)
    throw new Error('useScheduleContext must be used inside <ScheduleProvider>')
  return ctx
}
