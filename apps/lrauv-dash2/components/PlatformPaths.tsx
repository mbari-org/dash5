import React from 'react'
import dynamic from 'next/dynamic'
import { Pane } from 'react-leaflet'
import { useSelectedPlatforms } from './SelectedPlatformContext'
import { usePlatformList } from '../lib/usePlatformList'
import { ODSS_BASE_URL, PLATFORM_PANE, PLATFORM_PANE_Z } from '../lib/constants'

const PlatformPath = dynamic(
  () => import('./PlatformPath').then((mod) => ({ default: mod.PlatformPath })),
  {
    ssr: false,
  }
)

/**
 * Component that renders PlatformPath components for all selected platforms.
 * This extracts the common pattern of mapping over selectedPlatformIds and
 * rendering PlatformPath components with platform data from platformMap.
 */
export const PlatformPaths: React.FC = () => {
  const { selectedPlatformIds } = useSelectedPlatforms()
  const { platformMap } = usePlatformList()

  return (
    <>
      {/* Single pane declaration for ship/platform polylines and circle markers
          (icon Markers stay in the default markerPane) — declared here once to
          avoid duplicate-pane errors when multiple ships are selected. */}
      <Pane name={PLATFORM_PANE} style={{ zIndex: PLATFORM_PANE_Z }} />
      {selectedPlatformIds.map((platformId) => {
        const platform = platformMap[platformId]
        if (!platform) return null

        const iconUrl = platform.iconUrl
          ? `${ODSS_BASE_URL}/${platform.iconUrl}`
          : undefined

        return (
          <PlatformPath
            key={platformId}
            platformId={platformId}
            platformName={platform.name}
            platformAbbrev={platform.abbreviation}
            color={platform.color}
            iconUrl={iconUrl}
          />
        )
      })}
    </>
  )
}
