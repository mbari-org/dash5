import { useEvents } from '../Event/useEvents'
import { SupportedQueryOptions } from '../types'

export const useRecentRuns = (
  params: { vehicles: string[]; from: string; to?: string; limit?: number },
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

  const data = query.data?.map((event) => {
    return {
      ...event,
      mission: `${event.data?.match(/[a-zA-Z_/]+(?=\.xml)/)?.[0]}.xml`,
    }
  })

  return { ...query, data }
}
