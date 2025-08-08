import { useState, useEffect } from 'react'
import { point, distance } from '@turf/turf'
import { WaypointProps } from '@mbari/react-ui'

export const useWaypointCalculations = (updatedWaypoints: WaypointProps[]) => {
  const [estDistance, setEstDistance] = useState<number | null>(null)

  useEffect(() => {
    const calculateDistance = () => {
      try {
        const applicableWaypoints = updatedWaypoints.filter(
          (w) => ![w.lat?.toLowerCase(), w.lon?.toLowerCase()].includes('nan')
        )

        if (applicableWaypoints.length > 0) {
          const newDistance = applicableWaypoints.reduce((acc, curr, index) => {
            if (index === 0) return acc

            const prev = applicableWaypoints[index - 1]
            return (
              acc +
              distance(
                point([Number(curr.lat ?? 0), Number(curr.lon ?? 0)]),
                point([Number(prev.lat ?? 0), Number(prev.lon ?? 0)]),
                { units: 'kilometers' }
              )
            )
          }, 0)

          setEstDistance(newDistance)
        } else {
          setEstDistance(null)
        }
      } catch (error) {
        console.error('Error calculating waypoint distance:', error)
        setEstDistance(null)
      }
    }

    // Debounce the calculation
    const timeoutId = setTimeout(calculateDistance, 300)
    return () => clearTimeout(timeoutId)
  }, [updatedWaypoints])

  return { estDistance }
}
