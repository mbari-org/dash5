import { useEvents } from '../Event/useEvents'
import { SupportedQueryOptions } from '../types'
import { extractOverrides } from '../../axios/Util/extractOverrides'
import { generateMissionKey } from '../../axios/Util/generateMissionKey'

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

  const formattedData = query.data?.map((event) => {
    const mission = event.data?.match(/[a-zA-Z_/]+(\.xml|\.tl)/)?.[0] ?? ''
    const { waypointOverrides, parameterOverrides } = extractOverrides(
      event.data ?? ''
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

  // Provide unique missions (unique mission name and waypoint and parameter overrides) if requested
  const data = params.unique
    ? formattedData?.filter(
        (event, index, self) =>
          self.findIndex((e) => e.missionKey === event.missionKey) === index
      )
    : formattedData

  return { ...query, data }
}
