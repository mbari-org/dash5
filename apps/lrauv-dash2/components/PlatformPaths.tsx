import React, { useMemo } from 'react'
import dynamic from 'next/dynamic'
import { DateTime } from 'luxon'
import { useSelectedPlatforms } from './SelectedPlatformContext'
import { usePlatformList } from '../lib/usePlatformList'

const PlatformPath = dynamic(
  () => import('./PlatformPath').then((mod) => ({ default: mod.PlatformPath })),
  {
    ssr: false,
  }
)

// Ships (AIS / SPOT trackers) report far less frequently than AUVs/gliders.
// Use a 7-day window for ship-type platforms so that vessels with slow or
// intermittent tracking (e.g. SPOT satellite trackers) still appear on the map.
const SHIP_WINDOW_DAYS = 7
const DEFAULT_WINDOW_DAYS = 1

/**
 * Component that renders PlatformPath components for all selected platforms.
 * This extracts the common pattern of mapping over selectedPlatformIds and
 * rendering PlatformPath components with platform data from platformMap.
 */
export const PlatformPaths: React.FC = () => {
  const { selectedPlatformIds } = useSelectedPlatforms()
  const { platformMap } = usePlatformList()

  const now = useMemo(() => DateTime.utc(), [])

  return (
    <>
      {selectedPlatformIds.map((platformId) => {
        const platform = platformMap[platformId]
        if (!platform) return null

        const isShip = platform.typeName === 'ship'
        const windowDays = isShip ? SHIP_WINDOW_DAYS : DEFAULT_WINDOW_DAYS
        const startDate = now.minus({ days: windowDays }).toISO() ?? undefined
        const endDate = now.toISO() ?? undefined

        return (
          <PlatformPath
            key={platformId}
            platformId={platformId}
            platformName={platform.name}
            platformAbbrev={platform.abbreviation}
            color={platform.color}
            startDate={startDate}
            endDate={endDate}
          />
        )
      })}
    </>
  )
}
