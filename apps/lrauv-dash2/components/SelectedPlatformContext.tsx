import React, { createContext, useContext, useState } from 'react'

// Define or import the Station type
interface Platform {
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

export interface SelectedPlatformsContextProps {
  selectedPlatforms: Platform[]
  setSelectedPlatforms: React.Dispatch<React.SetStateAction<Platform[]>>
  togglePlatform: (platform: Platform) => void
}

const SelectedPlatformsContext = createContext<
  SelectedPlatformsContextProps | undefined
>(undefined)

export const SelectedPlatformsProvider: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>([])

  const togglePlatform = (platform: Platform) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform]
    )
  }

  return (
    <SelectedPlatformsContext.Provider
      value={{ selectedPlatforms, setSelectedPlatforms, togglePlatform }}
    >
      {children}
    </SelectedPlatformsContext.Provider>
  )
}

export const useSelectedPlatforms = () => {
  const context = useContext(SelectedPlatformsContext)
  if (!context) {
    throw new Error(
      'useSelectedPlatformss must be used within a SelectedPlatformssProvider'
    )
  }
  return context
}
