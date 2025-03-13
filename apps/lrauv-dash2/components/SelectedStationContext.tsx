import React, { createContext, useContext, useState } from 'react'

// Define or import the Station type
interface Station {
  name: string
  lat: number
  lon: number
  geojson: {
    geometry: {
      type: string
      coordinates: [number, number]
    }
  }
}

export interface SelectedStationsContextProps {
  selectedStations: Station[]
  setSelectedStations: React.Dispatch<React.SetStateAction<Station[]>>
  toggleStation: (station: Station) => void
}

const SelectedStationsContext = createContext<
  SelectedStationsContextProps | undefined
>(undefined)

export const SelectedStationsProvider: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  const [selectedStations, setSelectedStations] = useState<Station[]>([])

  const toggleStation = (station: Station) => {
    setSelectedStations((prev) =>
      prev.includes(station)
        ? prev.filter((s) => s !== station)
        : [...prev, station]
    )
  }

  return (
    <SelectedStationsContext.Provider
      value={{ selectedStations, setSelectedStations, toggleStation }}
    >
      {children}
    </SelectedStationsContext.Provider>
  )
}

export const useSelectedStations = () => {
  const context = useContext(SelectedStationsContext)
  if (!context) {
    throw new Error(
      'useSelectedStations must be used within a SelectedStationsProvider'
    )
  }
  return context
}
