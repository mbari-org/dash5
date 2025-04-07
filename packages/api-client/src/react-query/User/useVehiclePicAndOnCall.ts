import { useMemo } from 'react'
import { extractPicAndOnCallFromNotes } from '../../axios/Util/extractPicAndOnCallFromNotes'
import { useEvents } from '../Event/useEvents'
import { DateTime } from 'luxon'
import { getAdjustedUnixTime } from '@mbari/utils'

const THREE_MONTHS_AGO = getAdjustedUnixTime({
  unixTime: DateTime.now().toMillis(),
  offsetMonths: -3,
})

export interface VehiclePicAndOnCallUser {
  user: string
  unixTime: number
}

export interface VehiclePicAndOnCallResponse {
  pic: VehiclePicAndOnCallUser | null
  onCall: VehiclePicAndOnCallUser | null
  isLoading: boolean
}

export interface UseVehiclePicAndOnCallParams {
  vehicleName: string
  from?: number // milliseconds since epoch
  to?: number // milliseconds since epoch
  enabled?: boolean
}

/**
 * Hook to get the PIC and OnCall users for a vehicle from note events (current endpoint for PIC and OnCall only retrieves roles from active deployments)
 * @param params Parameters including vehicleName and time range
 * @returns The PIC and OnCall users found in the notes, with loading state
 */
export const useVehiclePicAndOnCall = ({
  vehicleName,
  from,
  to,
  enabled = true,
}: UseVehiclePicAndOnCallParams): VehiclePicAndOnCallResponse => {
  const { data: noteEvents, isLoading } = useEvents(
    {
      vehicles: [vehicleName],
      from: from ?? THREE_MONTHS_AGO,
      eventTypes: ['note'],
      to,
      limit: 3000,
    },
    {
      enabled,
    }
  )

  const picAndCall = useMemo(() => {
    if (!noteEvents?.length) {
      return { pic: null, onCall: null }
    }

    return extractPicAndOnCallFromNotes(noteEvents)
  }, [noteEvents])

  return {
    ...picAndCall,
    isLoading,
  }
}
