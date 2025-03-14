import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from 'react'

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
        console.error('Failed to parse stored stations:', error)
        return []
      }
    }
    return []
  })

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
        console.log('Old value:', e.oldValue)
        console.log('New value:', e.newValue)

        try {
          const newValue = e.newValue ? JSON.parse(e.newValue) : []
          setSelectedStations(newValue)
          console.log('Updated state with new value from another tab')
        } catch (error) {
          console.error('Failed to parse updated stations from storage:', error)
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
            console.log('Stored value differs from current state - updating')
            console.log('Current state:', selectedStations)
            console.log('Stored value:', parsedValue)
            setSelectedStations(parsedValue)
          } else {
            console.log('Stored value matches current state - no update needed')
          }
        } catch (error) {
          console.error('Failed to parse stored stations on focus:', error)
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
    console.group(`🔵 SelectedStationsProvider (${providerId}) - Initialized`)
    console.log('Initial state:', selectedStations)
    console.log('Total provider instances:', instanceCounter)
    console.groupEnd()

    return () => {
      console.log(`🔴 SelectedStationsProvider (${providerId}) - Unmounted`)
    }
  }, [providerId, selectedStations])

  // Track state changes
  useEffect(() => {
    console.group(`🔄 SelectedStationsProvider (${providerId}) - State Updated`)
    console.log('Current stations:', selectedStations)
    console.log('Station count:', selectedStations.length)
    console.log(
      'Station names:',
      selectedStations.map((s) => s.name)
    )
    console.groupEnd()
  }, [selectedStations, providerId])

  const toggleStation = (station: Station) => {
    console.group(`🔧 toggleStation called in provider (${providerId})`)
    console.log('Station:', station)

    // Check if station is already selected
    const isAlreadySelected = selectedStations.some(
      (s) => s.name === station.name
    )
    console.log('Is already selected:', isAlreadySelected)

    setSelectedStations((prev) => {
      const updated = isAlreadySelected
        ? prev.filter((s) => s.name !== station.name)
        : [...prev, station]

      console.log('Updated stations:', updated)
      console.log('New count:', updated.length)
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
    console.error(
      `❌ useSelectedStations failed - No provider found in component: ${componentName}`
    )
    throw new Error(
      'useSelectedStations must be used within a SelectedStationsProvider'
    )
  }

  // Log whenever the context is consumed
  console.log(
    `📌 useSelectedStations consumed in ${componentName} (from provider ${context.debug.providerId})`
  )
  console.log(`  - Has ${context.selectedStations.length} stations selected`)

  return context
}
