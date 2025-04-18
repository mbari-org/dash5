import { useCallback, useRef, useEffect, useState } from 'react'
import toast from 'react-hot-toast'

interface DepthResult {
  depth: number | null
  status: 'success' | 'error' | 'no-data' | 'unavailable'
}

export function useElevator() {
  const elevator = useRef<any>(null)
  const lastKnownDepth = useRef<number | null>(null)
  const depthLoading = useRef<boolean>(false)
  const [mapsAvailable, setMapsAvailable] = useState(false)
  const elevationErrorShown = useRef(false)

  // Initialize the elevator service when Google Maps loads
  useEffect(() => {
    const initElevator = () => {
      try {
        // Extra defensive check for window and google
        if (
          typeof window !== 'undefined' &&
          window.google?.maps?.ElevationService
        ) {
          try {
            elevator.current = new window.google.maps.ElevationService()
            setMapsAvailable(true)
            console.log('✅ Elevation service initialized')
          } catch (error) {
            console.warn('⚠️ Failed to initialize elevation service:', error)
            elevator.current = null
            setMapsAvailable(false)
          }
        } else {
          console.warn('⚠️ Google Maps not available for elevation service')
          elevator.current = null
          setMapsAvailable(false)
        }
      } catch (e) {
        console.warn('⚠️ Error checking Google Maps availability:', e)
        elevator.current = null
        setMapsAvailable(false)
      }
    }

    // Try to initialize immediately
    initElevator()

    // Also set up a listener for when Maps might load later
    const checkInterval = setInterval(() => {
      if (
        !elevator.current &&
        typeof window !== 'undefined' &&
        window.google?.maps?.ElevationService
      ) {
        initElevator()
        if (elevator.current) clearInterval(checkInterval)
      }
    }, 2000)

    return () => clearInterval(checkInterval)
  }, [])

  const handleDepthRequest = useCallback(
    async (lat: number, lng: number): Promise<DepthResult> => {
      // First check if Google Maps is available - super defensive
      try {
        // Double-check if Maps is available
        if (
          typeof window === 'undefined' ||
          !window.google ||
          !window.google.maps ||
          !window.google.maps.ElevationService
        ) {
          if (!elevationErrorShown.current) {
            console.warn('⚠️ Google Maps API not available')
            elevationErrorShown.current = true
          }
          return { depth: null, status: 'unavailable' }
        }

        // If elevator is not initialized, try to initialize it
        if (!elevator.current) {
          try {
            elevator.current = new window.google.maps.ElevationService()
          } catch (error) {
            console.warn('⚠️ Could not create elevation service:', error)
            return { depth: null, status: 'unavailable' }
          }
        }

        // If we're already loading, return the last known depth
        if (depthLoading.current) {
          return {
            depth: lastKnownDepth.current,
            status: lastKnownDepth.current !== null ? 'success' : 'no-data',
          }
        }

        // Prepare the request
        const r = {
          locations: [{ lat, lng }],
        }

        depthLoading.current = true

        // CRITICAL: Triple check elevator exists before API call
        if (!elevator.current) {
          depthLoading.current = false
          return { depth: null, status: 'unavailable' }
        }

        // Wrap the API call in its own try/catch
        let result
        try {
          // Safe API call with timeout
          const getElevationPromise =
            elevator.current.getElevationForLocations(r)

          // Add timeout to prevent hanging
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(
              () => reject(new Error('Elevation request timed out')),
              5000
            )
          )

          // Race between actual request and timeout
          result = await Promise.race([getElevationPromise, timeoutPromise])
        } catch (apiError) {
          console.warn('⚠️ Elevation API call failed:', apiError)
          depthLoading.current = false
          return { depth: null, status: 'error' }
        }

        // Process result safely
        lastKnownDepth.current = result?.results?.[0]?.elevation ?? null
        depthLoading.current = false

        return {
          depth: lastKnownDepth.current,
          status: lastKnownDepth.current !== null ? 'success' : 'no-data',
        }
      } catch (outerError) {
        // Catch all possible errors
        console.error('❌ Unexpected error in elevation service:', outerError)
        depthLoading.current = false
        return { depth: null, status: 'error' }
      }
    },
    []
  )

  return { handleDepthRequest, elevationAvailable: mapsAvailable }
}

export default useElevator
// import { useCallback, useRef, useMemo } from 'react'

// export const useGoogleElevator = () => {
//   const elevator = useMemo(() => {
//     if (
//       typeof google !== 'undefined' &&
//       google.maps &&
//       google.maps.ElevationService
//     ) {
//       return new google.maps.ElevationService()
//     }
//     return null
//   }, [])

//   const depthLoading = useRef(false)
//   const lastKnownDepth = useRef<number | null>(null)

//   const handleDepthRequest = useCallback(
//     async (lat: number, lng: number) => {
//       if (!elevator) {
//         console.error('Elevation service is unavailable.')
//         return 0
//       }

//       if (depthLoading.current) return lastKnownDepth.current ?? 0

//       try {
//         const r: google.maps.LocationElevationRequest = {
//           locations: [{ lat, lng }],
//         }

//         depthLoading.current = true
//         const result = await elevator.getElevationForLocations(r)
//         lastKnownDepth.current = result?.results?.[0]?.elevation ?? null
//       } catch (error) {
//         console.error('Error fetching elevation:', error)
//       } finally {
//         depthLoading.current = false
//       }

//       return lastKnownDepth.current ?? 0
//     },
//     [elevator]
//   )

//   return { handleDepthRequest }
// }
