import { useEvents } from '../Event/useEvents'
import { SupportedQueryOptions } from '../types'
import { extractOverridesWithScriptMetadata } from '../../axios/Util/extractOverridesWithScriptMetadata'
import { generateMissionKey } from '../../axios/Util/generateMissionKey'
import { useQuery } from 'react-query'
import { useTethysApiContext } from '../TethysApiProvider'
import { getScript } from '../../axios'
import { createLimiter } from '../../axios/Util/concurrencyLimiter'

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

      // Limit concurrent getScript requests
      const limit = createLimiter(1)

      // Cache script metadata requests by mission so we only fetch once per mission during this run
      const scriptRequestByMission = new Map<
        string,
        ReturnType<typeof getScript>
      >()

      const results = await Promise.all(
        query.data.map(async (event) => {
          const mission =
            event.data?.match(/[A-Za-z0-9_/]+\.(?:xml|tl)/)?.[0] ?? ''

          const fetchScript = mission
            ? async () => {
                let request = scriptRequestByMission.get(mission)
                if (!request) {
                  request = limit(() =>
                    getScript(
                      { path: mission, gitRef: 'master' },
                      {
                        instance: axiosInstance,
                        headers: { Authorization: `Bearer ${token}` },
                      }
                    )
                  ) as ReturnType<typeof getScript>
                  scriptRequestByMission.set(mission, request)
                }
                return request
              }
            : undefined

          const { waypointOverrides, parameterOverrides } =
            await extractOverridesWithScriptMetadata(
              event.data ?? '',
              mission || undefined,
              fetchScript,
              { logContext: mission }
            )

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
      staleTime: options?.staleTime ?? 30 * 60 * 1000,
      refetchOnWindowFocus: false,
    }
  )

  return {
    ...query,
    data: derived.data,
    isLoading: query.isLoading || derived.isLoading,
  }
}
