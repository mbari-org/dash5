import { useMemo } from 'react'
import { GetPlatformsResponse, usePlatforms } from '@mbari/api-client'

/**
 * Hook that fetches the list of available platforms and creates a map of platform ID to platform data.
 * This is commonly used to look up platform details by ID.
 *
 * @returns An object containing:
 *   - platforms: The raw platforms array from the API
 *   - platformMap: A Record mapping platform IDs to platform objects for O(1) lookup
 */
export const usePlatformList = () => {
  const { data: platforms } = usePlatforms()

  const platformMap = useMemo(() => {
    return (
      platforms?.reduce(
        (
          acc: Record<string, GetPlatformsResponse>,
          p: GetPlatformsResponse
        ) => {
          acc[p._id] = p
          return acc
        },
        {} as Record<string, GetPlatformsResponse>
      ) ?? {}
    )
  }, [platforms])

  return { platforms, platformMap }
}
