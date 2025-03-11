import { isUploadEvent } from './formatEvent'
import { useEvents } from '@mbari/api-client'
import { DateTime } from 'luxon'
import { getAdjustedUnixTime } from '@mbari/utils'

export const useLastCommsTime = (
  vehicleName: string,
  startTimeMillis: number
) => {
  const adjustedStartTime = getAdjustedUnixTime({
    unixTime: startTimeMillis,
    offsetDays: -1,
  })
  const { data: eventsData } = useEvents({
    vehicles: [vehicleName as string],
    eventTypes: ['sbdReceive', 'sbdSend'],
    from: adjustedStartTime,
  })

  return eventsData
    ?.filter(isUploadEvent)
    .sort((a, b) => b.unixTime - a.unixTime)
    .map((e) => e.unixTime)?.[0]
}
