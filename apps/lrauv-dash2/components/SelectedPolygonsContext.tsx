import React, { createContext, useContext } from 'react'
import { useSelectedNamesState } from './useSelectedNamesState'

const STORAGE_KEY = 'selectedPolygons'

interface SelectedPolygonsContextProps {
  selectedPolygons: string[]
  setSelectedPolygons: React.Dispatch<React.SetStateAction<string[]>>
}

const SelectedPolygonsContext = createContext<
  SelectedPolygonsContextProps | undefined
>(undefined)

export const SelectedPolygonsProvider: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  const [selectedPolygons, setSelectedPolygons] =
    useSelectedNamesState(STORAGE_KEY)

  return (
    <SelectedPolygonsContext.Provider
      value={{ selectedPolygons, setSelectedPolygons }}
    >
      {children}
    </SelectedPolygonsContext.Provider>
  )
}

export const useSelectedPolygons = () => {
  const context = useContext(SelectedPolygonsContext)
  if (!context) {
    throw new Error(
      'useSelectedPolygons must be used within a SelectedPolygonsProvider'
    )
  }
  return context
}
