import React, { createContext, useContext } from 'react'
import { useSelectedNamesState } from './useSelectedNamesState'

const STORAGE_KEY = 'selectedTileLayers'

interface SelectedTileLayersContextProps {
  selectedTileLayers: string[]
  setSelectedTileLayers: React.Dispatch<React.SetStateAction<string[]>>
}

const SelectedTileLayersContext = createContext<
  SelectedTileLayersContextProps | undefined
>(undefined)

export const SelectedTileLayersProvider: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  const [selectedTileLayers, setSelectedTileLayers] =
    useSelectedNamesState(STORAGE_KEY)

  return (
    <SelectedTileLayersContext.Provider
      value={{ selectedTileLayers, setSelectedTileLayers }}
    >
      {children}
    </SelectedTileLayersContext.Provider>
  )
}

export const useSelectedTileLayers = () => {
  const context = useContext(SelectedTileLayersContext)
  if (!context) {
    throw new Error(
      'useSelectedTileLayers must be used within a SelectedTileLayersProvider'
    )
  }
  return context
}
