import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from 'react'
import { createLogger } from '@mbari/utils'

const logger = createLogger('SelectedStationsContext')

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
  starredStations: string[]
  toggleStarStation: (name: string) => void
  highlightedStationName: string | null
  setHighlightedStationName: React.Dispatch<React.SetStateAction<string | null>>
  flyToRequest: {
    lat: number
    lon: number
    bounds?: [[number, number], [number, number]]
  } | null
  setFlyToRequest: React.Dispatch<
    React.SetStateAction<{
      lat: number
      lon: number
      bounds?: [[number, number], [number, number]]
    } | null>
  >
  debug: {
    providerId: string
    instanceCount: number
  }
}

const SelectedStationsContext = createContext<
  SelectedStationsContextProps | undefined
>(undefined)

// Track how many providers we've created to detect multiple instances
let instanceCounter = 0
// Key for localStorage
const STORAGE_KEY = 'selectedStations'
const STARRED_STORAGE_KEY = 'starredStations'

export const SelectedStationsProvider: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  // Initialize from localStorage if available
  const [selectedStations, setSelectedStations] = useState<Station[]>(() => {
    // Only run in client-side
    if (typeof window !== 'undefined') {
      try {
        const storedValue = localStorage.getItem(STORAGE_KEY)
        return storedValue ? JSON.parse(storedValue) : []
      } catch (error) {
        logger.error('Failed to parse stored stations:', error)
        return []
      }
    }
    return []
  })

  const [starredStations, setStarredStations] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STARRED_STORAGE_KEY)
        if (!stored) {
          return []
        }
        const parsed = JSON.parse(stored)
        return Array.isArray(parsed) ? parsed : []
      } catch {
        return []
      }
    }
    return []
  })

  const [highlightedStationName, setHighlightedStationName] = useState<
    string | null
  >(null)

  const [flyToRequest, setFlyToRequest] = useState<{
    lat: number
    lon: number
    bounds?: [[number, number], [number, number]]
  } | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STARRED_STORAGE_KEY, JSON.stringify(starredStations))
    }
  }, [starredStations])

  // Sync starredStations across tabs and on tab re-focus (mirrors the
  // selectedStations cross-tab sync logic already present in this provider).
  useEffect(() => {
    if (typeof window === 'undefined') return

    const parseStarred = (raw: string | null): string[] => {
      try {
        if (!raw) return []
        const parsed = JSON.parse(raw)
        return Array.isArray(parsed) ? parsed : []
      } catch {
        return []
      }
    }

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key !== STARRED_STORAGE_KEY) return
      const next = parseStarred(e.newValue)
      setStarredStations((current) =>
        JSON.stringify(current) === JSON.stringify(next) ? current : next
      )
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const next = parseStarred(localStorage.getItem(STARRED_STORAGE_KEY))
        setStarredStations((current) =>
          JSON.stringify(current) === JSON.stringify(next) ? current : next
        )
      }
    }

    window.addEventListener('storage', handleStorageChange)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  const toggleStarStation = (name: string) => {
    setStarredStations((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    )
  }

  const providerId = useRef(
    `provider-${Date.now()}-${++instanceCounter}`
  ).current

  // Save to localStorage whenever selectedStations changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (selectedStations.length > 0 || localStorage.getItem(STORAGE_KEY)) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedStations))
      }
    }
  }, [selectedStations])

  // Handle sync across tabs and on visibility change
  useEffect(() => {
    if (typeof window === 'undefined') return

    // Function to handle storage changes from other tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        console.group(`📱 Storage change detected in (${providerId})`)
        logger.debug('Old value:', e.oldValue)
        logger.debug('New value:', e.newValue)

        try {
          const newValue = e.newValue ? JSON.parse(e.newValue) : []
          setSelectedStations(newValue)
          logger.debug('Updated state with new value from another tab')
        } catch (error) {
          logger.error('Failed to parse updated stations from storage:', error)
        }

        console.groupEnd()
      }
    }

    // Function to handle tab focus
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.group(`👁️ Tab became visible (${providerId}) - Syncing state`)

        try {
          const storedValue = localStorage.getItem(STORAGE_KEY)
          const parsedValue = storedValue ? JSON.parse(storedValue) : []

          // Only update if different to avoid unnecessary re-renders
          if (
            JSON.stringify(parsedValue) !== JSON.stringify(selectedStations)
          ) {
            logger.debug('Stored value differs from current state - updating')
            logger.debug('Current state:', selectedStations)
            logger.debug('Stored value:', parsedValue)
            setSelectedStations(parsedValue)
          } else {
            logger.debug(
              'Stored value matches current state - no update needed'
            )
          }
        } catch (error) {
          logger.error('Failed to parse stored stations on focus:', error)
        }

        console.groupEnd()
      }
    }

    // Add event listeners
    window.addEventListener('storage', handleStorageChange)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Cleanup on unmount
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [selectedStations, providerId])

  // Log when provider is mounted
  useEffect(() => {
    // console.group(`🔵 SelectedStationsProvider (${providerId}) - Initialized`)
    // logger.debug('Initial state:', selectedStations)
    // logger.debug('Total provider instances:', instanceCounter)
    // console.groupEnd()

    return () => {
      // logger.debug(`🔴 SelectedStationsProvider (${providerId}) - Unmounted`)
    }
  }, [providerId, selectedStations])

  // Track state changes
  useEffect(() => {
    // console.group(`🔄 SelectedStationsProvider (${providerId}) - State Updated`)
    // logger.debug('Current stations:', selectedStations)
    // logger.debug('Station count:', selectedStations.length)
    // logger.debug(
    //   'Station names:',
    //   selectedStations.map((s) => s.name)
    // )
    // console.groupEnd()
  }, [selectedStations, providerId])

  const toggleStation = (station: Station) => {
    // console.group(`🔧 toggleStation called in provider (${providerId})`)
    // logger.debug('Station:', station)

    // Check if station is already selected
    const isAlreadySelected = selectedStations.some(
      (s) => s.name === station.name
    )
    // logger.debug('Is already selected:', isAlreadySelected)

    setSelectedStations((prev) => {
      const updated = isAlreadySelected
        ? prev.filter((s) => s.name !== station.name)
        : [...prev, station]

      // logger.debug('Updated stations:', updated)
      // logger.debug('New count:', updated.length)
      return updated
    })
    console.groupEnd()
  }

  return (
    <SelectedStationsContext.Provider
      value={{
        selectedStations,
        setSelectedStations,
        toggleStation,
        starredStations,
        toggleStarStation,
        highlightedStationName,
        setHighlightedStationName,
        flyToRequest,
        setFlyToRequest,
        debug: {
          providerId,
          instanceCount: instanceCounter,
        },
      }}
    >
      {children}
    </SelectedStationsContext.Provider>
  )
}

export const useSelectedStations = () => {
  const context = useContext(SelectedStationsContext)
  const componentName = new Error().stack?.split('\n')[2]?.trim() || 'unknown'

  if (!context) {
    logger.error(
      `❌ useSelectedStations failed - No provider found in component: ${componentName}`
    )
    throw new Error(
      'useSelectedStations must be used within a SelectedStationsProvider'
    )
  }

  // Log whenever the context is consumed
  // logger.debug(
  //   `📌 useSelectedStations consumed in ${componentName} (from provider ${context.debug.providerId})`
  // )
  // logger.debug(`  - Has ${context.selectedStations.length} stations selected`)

  return context
}
