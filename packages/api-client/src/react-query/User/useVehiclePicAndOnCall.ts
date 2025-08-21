import { useMemo } from 'react'
import { extractPicAndOnCallFromNotes } from '../../axios/Util/extractPicAndOnCallFromNotes'
import { getEvents, GetEventsResponse } from '../../axios/Event/getEvents'
import { getLastDeployment } from '../../axios/Deployment/getLastDeployment'
import { useTethysApiContext } from '../TethysApiProvider'
import { useQuery } from 'react-query'
import { DateTime } from 'luxon'
import { getAdjustedUnixTime } from '@mbari/utils'
import { SupportedQueryOptions } from '../types'

const THREE_MONTHS_AGO = getAdjustedUnixTime({
  unixTime: DateTime.now().toMillis(),
  offsetMonths: -3,
})

const STALE_TIME = 1000 * 60 * 30 // 30 minutes

export interface VehiclePicAndOnCallUser {
  user: string
  unixTime: number
}

export interface VehiclePicAndOnCallResponse {
  vehicleName: string
  unixTime: number
  pics: VehiclePicAndOnCallUser[]
  onCalls: VehiclePicAndOnCallUser[]
}

export interface UseVehiclePicAndOnCallResult {
  data: VehiclePicAndOnCallResponse[] | undefined
  isLoading: boolean
}

export interface UseVehiclePicAndOnCallParams {
  vehicleName: string | string[]
}

/**
 * Hook to get the PIC and On-Call users for one or more vehicles from note events
 * @param params   Query parameters (currently only vehicleName)
 * @param options  React-Query options such as enabled, staleTime, etc.
 * @returns The PIC and On-Call users found in the notes, with loading state
 */
export const useVehiclePicAndOnCall = (
  params: UseVehiclePicAndOnCallParams,
  options?: SupportedQueryOptions
): UseVehiclePicAndOnCallResult => {
  const { vehicleName } = params
  const vehicleNames = Array.isArray(vehicleName) ? vehicleName : [vehicleName]
  const { axiosInstance } = useTethysApiContext()

  const query = useQuery(
    ['users', 'picAndOnCall', vehicleNames],
    async () => {
      const results: GetEventsResponse[] = []

      // Get events for each vehicle separately
      for (const name of vehicleNames) {
        // Get last deployment for this vehicle
        const lastDeployment = await getLastDeployment(
          { vehicle: name },
          { instance: axiosInstance }
        )

        // Get events for this vehicle
        const events = await getEvents(
          {
            vehicles: [name],
            from: lastDeployment?.startEvent?.unixTime ?? THREE_MONTHS_AGO,
            eventTypes: ['note'],
            limit: 3000,
          },
          { instance: axiosInstance }
        )

        results.push(...events)
      }

      return results
    },
    {
      staleTime: STALE_TIME,
      ...options,
    }
  )

  const data = useMemo(() => {
    if (!query.data?.length) return undefined

    // Group events by vehicle
    const eventsByVehicle = query.data.reduce((acc, event) => {
      if (!event.vehicleName) return acc
      if (!acc[event.vehicleName]) {
        acc[event.vehicleName] = []
      }
      acc[event.vehicleName].push(event)
      return acc
    }, {} as Record<string, GetEventsResponse[]>)

    // Get PIC and OnCall for each vehicle
    return Object.entries(eventsByVehicle).map(([vehicleName, events]) => {
      const result = extractPicAndOnCallFromNotes(events)

      // Sort PICs and OnCalls by most recent
      const sortedPics =
        result.pics?.sort((a, b) => b.unixTime - a.unixTime) ?? []
      const sortedOnCalls =
        result.onCalls?.sort((a, b) => b.unixTime - a.unixTime) ?? []

      return {
        vehicleName,
        unixTime: Math.max(
          sortedPics[0]?.unixTime ?? 0,
          sortedOnCalls[0]?.unixTime ?? 0
        ),
        pics: sortedPics.map((pic) => ({
          user: pic.user,
          unixTime: pic.unixTime,
        })),
        onCalls: sortedOnCalls.map((onCall) => ({
          user: onCall.user,
          unixTime: onCall.unixTime,
        })),
      }
    })
  }, [query.data])

  return {
    data,
    isLoading: query.isLoading,
  }
}
