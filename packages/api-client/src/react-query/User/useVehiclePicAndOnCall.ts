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
  const vehicleNames = useMemo(
    () => (Array.isArray(vehicleName) ? vehicleName : [vehicleName]),
    [vehicleName]
  )
  const { axiosInstance, token } = useTethysApiContext()

  const query = useQuery(
    ['users', 'picAndOnCall', vehicleNames],
    async () => {
      const results: GetEventsResponse[] = []
      const authHeaders = token
        ? { Authorization: `Bearer ${token}` }
        : undefined

      // Get events for each vehicle separately
      for (const name of vehicleNames) {
        // Get last deployment for this vehicle
        const lastDeployment = await getLastDeployment(
          { vehicle: name },
          { instance: axiosInstance, headers: authHeaders }
        )

        // Get events for this vehicle
        const events = await getEvents(
          {
            vehicles: [name],
            from: lastDeployment?.startEvent?.unixTime ?? THREE_MONTHS_AGO,
            eventTypes: ['note'],
            limit: 3000,
          },
          { instance: axiosInstance, headers: authHeaders }
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
    // Ensure every requested vehicle is represented, even if no sign in or out events exist
    const eventsByVehicle: Record<string, GetEventsResponse[]> = {}

    vehicleNames.forEach((name) => {
      eventsByVehicle[name] = []
    })

    // Populate with any sign in or out events that came back from the query
    query.data?.forEach((event) => {
      if (!event.vehicleName) return
      if (!eventsByVehicle[event.vehicleName]) {
        eventsByVehicle[event.vehicleName] = []
      }
      eventsByVehicle[event.vehicleName].push(event)
    })

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
  }, [query.data, vehicleNames])

  return {
    data,
    isLoading: query.isLoading,
  }
}
