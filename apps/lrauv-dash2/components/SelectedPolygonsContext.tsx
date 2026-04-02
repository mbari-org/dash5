import React, { createContext, useContext, useState, useEffect } from 'react'

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
  const [selectedPolygons, setSelectedPolygons] = useState<string[]>(() => {
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
      localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedPolygons))
    }
  }, [selectedPolygons])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const handleStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) return
      try {
        const parsed = e.newValue ? JSON.parse(e.newValue) : []
        setSelectedPolygons(Array.isArray(parsed) ? parsed : [])
      } catch {
        /* ignore */
      }
    }
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        try {
          const stored = localStorage.getItem(STORAGE_KEY)
          const parsed = stored ? JSON.parse(stored) : []
          setSelectedPolygons((cur) => {
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
