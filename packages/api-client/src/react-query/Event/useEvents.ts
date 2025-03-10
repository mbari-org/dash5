import { useQuery } from 'react-query'
import { getEvents, GetEventsParams, GetEventsResponse } from '../../axios'
import { useTethysApiContext } from '../TethysApiProvider'
import { SupportedQueryOptions } from '../types'

export const useEvents = (
  params: GetEventsParams,
  options?: SupportedQueryOptions
) => {
  const { axiosInstance } = useTethysApiContext()
  const query = useQuery(
    ['event', 'events', params],
    async () => {
      // Initial fetch
      const initialResults = await getEvents(params, {
        instance: axiosInstance,
      })

      // If from parameter was not specified or no results, just return initial results
      if (!params.from || initialResults.length === 0) {
        return initialResults
      }

      // Parse the from date to determine when to stop fetching
      const fromDate = new Date(params.from).getTime()

      let allResults = [...initialResults]
      let currentResults = initialResults
      let processedIds = new Set(initialResults.map((event) => event.eventId))

      // Continue fetching until we've reached or gone past the from date
      while (currentResults.length > 0) {
        // Find the earliest timestamp in the current results
        const earliestEvent = currentResults.reduce(
          (earliest, current) =>
            current.unixTime < earliest.unixTime ? current : earliest,
          currentResults[0]
        )

        // If we've reached or gone past the from date, we're done
        // Make sure the comparison is correct - we want to keep fetching until
        // the oldest event we've found is older than or equal to the fromDate
        if (earliestEvent.unixTime <= fromDate) {
          console.log(
            'Breaking recursive fetch because earliest event timestamp',
            earliestEvent.unixTime,
            'is earlier than or equal to fromDate',
            fromDate
          )
          break
        }

        // Prepare parameters for the next request using the earliest timestamp as the 'to'
        // Subtract 1 millisecond to avoid including the same event again
        const nextTime = earliestEvent.unixTime - 1
        const nextParams: GetEventsParams = {
          ...params,
          to: new Date(nextTime).toISOString(),
        }

        // Fetch the next batch of results
        currentResults = await getEvents(nextParams, {
          instance: axiosInstance,
        })

        // If no new results, break the loop
        if (currentResults.length === 0) {
          break
        }

        // Filter out any duplicate events and add to accumulated results
        const newResults = currentResults.filter(
          (event) => !processedIds.has(event.eventId)
        )

        // If there are no new events after filtering duplicates, break to avoid infinite loop
        if (newResults.length === 0) {
          break
        }

        // Update processed IDs
        newResults.forEach((event) => processedIds.add(event.eventId))

        // Add new results to the accumulated results
        allResults = [...allResults, ...newResults]
      }

      return allResults
    },
    {
      staleTime: 5 * 60 * 1000,
      ...options,
    }
  )
  return query
}
