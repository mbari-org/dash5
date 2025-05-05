import React, { createContext, useContext, ReactNode, useState } from 'react'
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
  setAlternateAddress: (value: string | null) => void
  setConfirmedVehicle: (value: string | null) => void
  setShowAlternateAddress: (value: boolean) => void
  setScheduleMethod: (value: ScheduleMethod) => void
  setCustomScheduleId: (value: string | null) => void
  setNotes: (value: string | null) => void
  setSpecifiedTime: (value: string | null) => void
  setCommType: (value: CommType) => void
  setTimeout: (value: number | undefined) => void
}

type ScheduleContextType = {
  state: ScheduleState
  actions: ScheduleActions
}

const ScheduleContext = createContext<ScheduleContextType | undefined>(
  undefined
)

interface ScheduleProviderProps {
  children: ReactNode
  value: ScheduleContextType
}

export const ScheduleProvider: React.FC<ScheduleProviderProps> = ({
  children,
  value,
}) => {
  return (
    <ScheduleContext.Provider value={value}>
      {children}
    </ScheduleContext.Provider>
  )
}

export function useScheduleContext() {
  const context = useContext(ScheduleContext)
  if (!context) {
    throw new Error('useScheduleContext must be used within a ScheduleProvider')
  }
  return context
}

export function useSchedule(initialState?: Partial<ScheduleState>) {
  const [alternateAddress, setAlternateAddress] = useState<string | null>(
    initialState?.alternateAddress ?? null
  )
  const [confirmedVehicle, setConfirmedVehicle] = useState<string | null>(
    initialState?.confirmedVehicle ?? null
  )
  const [showAlternateAddress, setShowAlternateAddress] = useState(
    initialState?.showAlternateAddress ?? false
  )
  const [scheduleMethod, setScheduleMethod] = useState<ScheduleMethod>(
    initialState?.scheduleMethod ?? 'ASAP'
  )
  const [customScheduleId, setCustomScheduleId] = useState<string | null>(
    initialState?.customScheduleId ?? null
  )
  const [notes, setNotes] = useState<string | null>(initialState?.notes ?? null)
  const [specifiedTime, setSpecifiedTime] = useState<string | null>(
    initialState?.specifiedTime ?? null
  )
  const [commType, setCommType] = useState<CommType>(
    initialState?.commType ?? 'cellsat'
  )
  const [timeout, setTimeout] = useState<number | undefined>(
    initialState?.timeout ?? 5
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

  const contextValue = { state, actions }

  const Provider = ({ children }: { children: ReactNode }) => (
    <ScheduleContext.Provider value={contextValue}>
      {children}
    </ScheduleContext.Provider>
  )

  return {
    state,
    actions,
    Provider,
  }
}
