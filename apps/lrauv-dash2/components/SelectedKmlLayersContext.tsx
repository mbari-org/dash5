import React, { createContext, useContext } from 'react'
import { useSelectedNamesState } from './useSelectedNamesState'

const STORAGE_KEY = 'selectedKmlLayers'

interface SelectedKmlLayersContextProps {
  selectedKmlLayers: string[]
  setSelectedKmlLayers: React.Dispatch<React.SetStateAction<string[]>>
}

const SelectedKmlLayersContext = createContext<
  SelectedKmlLayersContextProps | undefined
>(undefined)

export const SelectedKmlLayersProvider: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  const [selectedKmlLayers, setSelectedKmlLayers] =
    useSelectedNamesState(STORAGE_KEY)

  return (
    <SelectedKmlLayersContext.Provider
      value={{ selectedKmlLayers, setSelectedKmlLayers }}
    >
      {children}
    </SelectedKmlLayersContext.Provider>
  )
}

export const useSelectedKmlLayers = () => {
  const context = useContext(SelectedKmlLayersContext)
  if (!context) {
    throw new Error(
      'useSelectedKmlLayers must be used within a SelectedKmlLayersProvider'
    )
  }
  return context
}
