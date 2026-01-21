import React, { createContext, useContext, useEffect, useState } from 'react'

export interface SelectedPlatformsContextProps {
  selectedPlatformIds: string[]
  setSelectedPlatformIds: React.Dispatch<React.SetStateAction<string[]>>
  togglePlatformId: (platformId: string) => void
}

const SelectedPlatformsContext = createContext<
  SelectedPlatformsContextProps | undefined
>(undefined)

export const SelectedPlatformsProvider: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  const [selectedPlatformIds, setSelectedPlatformIds] = useState<string[]>(
    () => {
      try {
        const stored = localStorage.getItem('selectedTrackingDbAssetIds')
        return stored ? JSON.parse(stored) : []
      } catch {
        return []
      }
    }
  )

  useEffect(() => {
    localStorage.setItem(
      'selectedTrackingDbAssetIds',
      JSON.stringify(selectedPlatformIds)
    )
  }, [selectedPlatformIds])

  const togglePlatformId = (platformId: string) => {
    setSelectedPlatformIds((prev) =>
      prev.includes(platformId)
        ? prev.filter((id) => id !== platformId)
        : [...prev, platformId]
    )
  }

  return (
    <SelectedPlatformsContext.Provider
      value={{
        selectedPlatformIds,
        setSelectedPlatformIds,
        togglePlatformId,
      }}
    >
      {children}
    </SelectedPlatformsContext.Provider>
  )
}

export const useSelectedPlatforms = () => {
  const context = useContext(SelectedPlatformsContext)
  if (!context) {
    throw new Error(
      'useSelectedPlatforms must be used within a SelectedPlatformsProvider'
    )
  }
  return context
}
