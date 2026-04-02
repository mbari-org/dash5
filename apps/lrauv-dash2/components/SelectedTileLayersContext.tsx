import React, { createContext, useContext, useState, useEffect } from 'react'

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
  const [selectedTileLayers, setSelectedTileLayers] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY)
        const parsed = stored ? JSON.parse(stored) : []
        return Array.isArray(parsed) ? parsed : []
      } catch {
        return []
      }
    }
    return []
  })

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedTileLayers))
    }
  }, [selectedTileLayers])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const handleStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) return
      try {
        const parsed = e.newValue ? JSON.parse(e.newValue) : []
        setSelectedTileLayers(Array.isArray(parsed) ? parsed : [])
      } catch {
        /* ignore */
      }
    }
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        try {
          const stored = localStorage.getItem(STORAGE_KEY)
          const parsed = stored ? JSON.parse(stored) : []
          setSelectedTileLayers((cur) => {
            const next = Array.isArray(parsed) ? parsed : []
            return JSON.stringify(cur) === JSON.stringify(next) ? cur : next
          })
        } catch {
          /* ignore */
        }
      }
    }
    window.addEventListener('storage', handleStorage)
    document.addEventListener('visibilitychange', handleVisibility)
    return () => {
      window.removeEventListener('storage', handleStorage)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [])

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
