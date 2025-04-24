import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from 'react'
import { createLogger } from '@mbari/utils'

const logger = createLogger('VehicleColorsContext')

// Define the default vehicle colors
const DEFAULT_VEHICLE_COLORS: Record<string, string> = {
  ahi: '#FF3333',
  aku: '#33FFFF',
  brizo: '#FF5733',
  daphne: '#33FF57',
  galene: '#3357FF',
  hela: '#FFFF33',
  'kilo moana': '#D733FF',
  makai: '#FF33F5',
  mana: '#33D7FF',
  melia: '#33FFF5',
  mesobot: '#FFD733',
  opah: '#F5FF33',
  polaris: '#D7FF33',
  pontus: '#964B00',
  stella: '#FF33D7',
  tethys: '#8533FF',
  triton: '#FF8533',
  tuna: '#33FFD7',
}

// Storage key for localStorage
const STORAGE_KEY = 'vehicleColors'

export interface VehicleColorsContextProps {
  vehicleColors: Record<string, string>
  defaultVehicleColors: Record<string, string>
  setVehicleColor: (vehicleName: string, color: string) => void
  resetVehicleColor: (vehicleName: string) => void
  resetAllVehicleColors: () => void
  debug: {
    providerId: string
    instanceCount: number
  }
}

export const VehicleColorsContext = createContext<VehicleColorsContextProps>({
  vehicleColors: {},
  defaultVehicleColors: DEFAULT_VEHICLE_COLORS,
  setVehicleColor: () => {},
  resetVehicleColor: () => {},
  resetAllVehicleColors: () => {},
  debug: {
    providerId: 'default',
    instanceCount: 0,
  },
})

// Track provider instances
let instanceCounter = 0

export const VehicleColorsProvider: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  // Initialize from localStorage or defaults
  const [vehicleColors, setVehicleColors] = useState<Record<string, string>>(
    () => {
      if (typeof window !== 'undefined') {
        try {
          const storedValue = localStorage.getItem(STORAGE_KEY)
          return storedValue ? JSON.parse(storedValue) : DEFAULT_VEHICLE_COLORS
        } catch (error) {
          logger.error('Failed to parse stored vehicle colors:', error)
          return DEFAULT_VEHICLE_COLORS
        }
      }
      return DEFAULT_VEHICLE_COLORS
    }
  )

  const providerId = useRef(
    `vcolor-provider-${Date.now()}-${++instanceCounter}`
  ).current

  // Save to localStorage when colors change
  useEffect(() => {
    // Save to localStorage whenever vehicleColors change
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(vehicleColors))
      } catch (error) {
        logger.error('Failed to save vehicle colors:', error)
      }
    }
  }, [vehicleColors])

  // Handle sync across tabs
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        try {
          const newValue = e.newValue
            ? JSON.parse(e.newValue)
            : DEFAULT_VEHICLE_COLORS
          setVehicleColors(newValue)
        } catch (error) {
          logger.error(
            'Failed to parse updated vehicle colors from storage:',
            error
          )
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  // Functions for modifying colors
  const setVehicleColor = (vehicleName: string, color: string) => {
    setVehicleColors((prev) => ({
      ...prev,
      [vehicleName]: color,
    }))
    logger.debug(`Set ${vehicleName} color to ${color}`)
  }

  const resetVehicleColor = (vehicleName: string) => {
    setVehicleColors((prev) => ({
      ...prev,
      [vehicleName]: DEFAULT_VEHICLE_COLORS[vehicleName],
    }))
    logger.debug(`Reset ${vehicleName} to default color`)
  }

  const resetAllVehicleColors = () => {
    setVehicleColors(DEFAULT_VEHICLE_COLORS)
    logger.debug('Reset all vehicle colors to default')
  }

  return (
    <VehicleColorsContext.Provider
      value={{
        vehicleColors,
        defaultVehicleColors: DEFAULT_VEHICLE_COLORS,
        setVehicleColor,
        resetVehicleColor,
        resetAllVehicleColors,
        debug: {
          providerId,
          instanceCount: instanceCounter,
        },
      }}
    >
      {children}
    </VehicleColorsContext.Provider>
  )
}

export const useVehicleColors = () => {
  const context = useContext(VehicleColorsContext)
  const componentName = new Error().stack?.split('\n')[2]?.trim() || 'unknown'

  if (!context) {
    logger.error(
      `useVehicleColors failed - No provider found in component: ${componentName}`
    )
    throw new Error(
      'useVehicleColors must be used within a VehicleColorsProvider'
    )
  }

  return context
}
