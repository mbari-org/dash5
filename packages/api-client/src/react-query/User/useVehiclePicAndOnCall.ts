import { useMemo } from 'react'
import { extractPicAndOnCallFromNotes } from '../../axios/Util/extractPicAndOnCallFromNotes'
import { useEvents } from '../Event/useEvents'
import { DateTime } from 'luxon'
import { getAdjustedUnixTime } from '@mbari/utils'
import { useLastDeployment } from '../Deployment/useLastDeployment'

const THREE_MONTHS_AGO = getAdjustedUnixTime({
  unixTime: DateTime.now().toMillis(),
  offsetMonths: -3,
})

export interface VehiclePicAndOnCallUser {
  user: string
  unixTime: number
}

export interface VehiclePicAndOnCallResponse {
  pics: VehiclePicAndOnCallUser[] | null
  onCalls: VehiclePicAndOnCallUser[] | null
  isLoading: boolean
}

export interface UseVehiclePicAndOnCallParams {
  vehicleName: string
  enabled?: boolean
}

/**
 * Hook to get the PIC and OnCall users for a vehicle from note events
 * @param params Parameters including vehicleName and enabled flag
 * @returns The PIC and OnCall users found in the notes, with loading state
 */
export const useVehiclePicAndOnCall = ({
  vehicleName,
  enabled = true,
}: UseVehiclePicAndOnCallParams): VehiclePicAndOnCallResponse => {
  // This mirrors the behavior of dash4 which uses the last deployment start time as the time frame for PIC and OnCall
  const { data: lastDeployment, isLoading: isLoadingDeployment } =
    useLastDeployment({ vehicle: vehicleName }, { enabled })

  const { data: noteEvents, isLoading: isLoadingEvents } = useEvents(
    {
      vehicles: [vehicleName],
      from: lastDeployment?.startEvent?.unixTime ?? THREE_MONTHS_AGO,
      eventTypes: ['note'],
      limit: 3000,
    },
    {
      enabled: enabled && !isLoadingDeployment,
    }
  )

  const picAndCall = useMemo(() => {
    if (!noteEvents?.length) {
      return { pics: null, onCalls: null }
    }

    return extractPicAndOnCallFromNotes(noteEvents)
  }, [noteEvents])

  return {
    ...picAndCall,
    isLoading: isLoadingDeployment || isLoadingEvents,
  }
}
