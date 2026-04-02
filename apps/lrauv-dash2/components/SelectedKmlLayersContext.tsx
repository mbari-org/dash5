import React, { createContext, useContext, useState, useEffect } from 'react'

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
  const [selectedKmlLayers, setSelectedKmlLayers] = useState<string[]>(() => {
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
      localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedKmlLayers))
    }
  }, [selectedKmlLayers])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const handleStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) return
      try {
        const parsed = e.newValue ? JSON.parse(e.newValue) : []
        setSelectedKmlLayers(Array.isArray(parsed) ? parsed : [])
      } catch {
        /* ignore */
      }
    }
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        try {
          const stored = localStorage.getItem(STORAGE_KEY)
          const parsed = stored ? JSON.parse(stored) : []
          setSelectedKmlLayers((cur) => {
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
