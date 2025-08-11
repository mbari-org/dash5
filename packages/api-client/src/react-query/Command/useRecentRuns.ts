import { useEvents } from '../Event/useEvents'
import { SupportedQueryOptions } from '../types'
import { extractOverrides } from '../../axios/Util/extractOverrides'
import { generateMissionKey } from '../../axios/Util/generateMissionKey'
import { useQuery } from 'react-query'
import { useTethysApiContext } from '../TethysApiProvider'
import { getScript } from '../../axios'

export const useRecentRuns = (
  params: {
    vehicles: string[]
    from: number
    to?: number
    limit?: number
    unique?: boolean
  },
  options?: SupportedQueryOptions
) => {
  const query = useEvents(
    {
      ...params,
      eventTypes: ['run'],
      ascending: 'n',
    },
    options
  )
  const { axiosInstance, token } = useTethysApiContext()

  const derived = useQuery(
    ['recentRunsProcessed', query.data, params.unique],
    async () => {
      if (!query.data) return undefined

      // Regex: /[a-zA-Z0-9_/]+(\.xml|\.tl)/
      //   • [a-zA-Z0-9_/]+  → one or more letters, digits, "_", or "/" (captures a simple path or filename)
      //   • (\.xml|\.tl)    → that sequence must end with ".xml" **or** ".tl" (the dot is escaped to mean a literal dot)
      // Summary → Pulls out the first path-like token in event.data that ends in one of those extensions
      const results = await Promise.all(
        query.data.map(async (event) => {
          const mission =
            event.data?.match(/[A-Za-z0-9_/]+\.(?:xml|tl)/)?.[0] ?? ''

          let { waypointOverrides, parameterOverrides } = extractOverrides(
            event.data ?? ''
          )

          // If there are non-standard lat/lon keywords, fetch script metadata to determine if they are waypoints (ie a param named CenterLat might be a waypoint or a param; only the script metadata can tell us)
          const hasNonstandardLatLonKeywords = parameterOverrides.some(
            ({ name }) => /(Lat(?:itude)?|Lon(?:gitude)?)/i.test(name)
          )

          if (hasNonstandardLatLonKeywords && mission) {
            try {
              const { latLonNamePairs } = await getScript(
                { path: mission, gitRef: 'master' },
                {
                  instance: axiosInstance,
                  headers: { Authorization: `Bearer ${token}` },
                }
              )
              if (latLonNamePairs?.length) {
                const newOverrides = extractOverrides(
                  event.data ?? '',
                  latLonNamePairs
                )
                waypointOverrides = newOverrides.waypointOverrides
                parameterOverrides = newOverrides.parameterOverrides
              }
            } catch {
              console.log(
                'Could not fetchscript metadata for recent mission: ',
                mission
              )
            }
          }

          const missionKey = generateMissionKey({
            missionName: mission,
            waypointOverrides,
            parameterOverrides,
          })

          return {
            ...event,
            mission,
            waypointOverrides,
            parameterOverrides,
            missionKey,
          }
        })
      )

      return params.unique
        ? results.filter(
            (event, index, self) =>
              self.findIndex((e) => e.missionKey === event.missionKey) === index
          )
        : results
    },
    {
      enabled: !!query.data,
    }
  )

  return {
    ...query,
    data: derived.data,
    isLoading: query.isLoading || derived.isLoading,
  }
}
