import React from 'react'
import dynamic from 'next/dynamic'
import { useSelectedPlatforms } from './SelectedPlatformContext'
import { usePlatformList } from '../lib/usePlatformList'

const PlatformPath = dynamic(
  () => import('./PlatformPath').then((mod) => ({ default: mod.PlatformPath })),
  {
    ssr: false,
  }
)

// iconUrl values from the TrackDB API are relative paths (e.g.
// "resources/images/platform-icons/spray-glider.png") that must be
// resolved against the ODSS base URL — same approach used in PlatformSection.
const ODSS_BASE_URL = 'https://odss.mbari.org/odss'

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
