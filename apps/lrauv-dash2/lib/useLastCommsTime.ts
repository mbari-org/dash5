import { isUploadEvent } from './formatEvent'
import { useEvents } from '@mbari/api-client'
import { DateTime } from 'luxon'

export const useLastCommsTime = (
  vehicleName: string,
  startTimeMillis: number
) => {
  const { data: eventsData } = useEvents({
    vehicles: [vehicleName as string],
    eventTypes: ['sbdReceive', 'sbdSend'],
    from: DateTime.fromMillis(startTimeMillis).minus({ days: 1 }).toISO(),
  })

  return eventsData
    ?.filter(isUploadEvent)
    .sort((a, b) => b.unixTime - a.unixTime)
    .map((e) => e.unixTime)?.[0]
}
