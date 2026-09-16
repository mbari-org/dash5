import { useQuery } from 'react-query'
import {
  getEvents,
  useLastDeployment,
  useTethysApiContext,
} from '@mbari/api-client'
import { parseBadBatteryFault } from './parseBadBatteryFault'

export const useBadBatteryFault = (vehicleName: string) => {
  const { axiosInstance } = useTethysApiContext()
  const { data: lastDeployment } = useLastDeployment(
    { vehicle: vehicleName },
    { enabled: !!vehicleName, staleTime: 5 * 60 * 1000 }
  )
  const from =
    lastDeployment?.launchEvent?.unixTime ??
    lastDeployment?.startEvent?.unixTime ??
    1

  return useQuery(
    ['widget', 'badBatteryFault', vehicleName, from],
    async () => {
      const events = await getEvents(
        {
          vehicles: [vehicleName],
          eventTypes: ['logFault'],
          from,
          limit: 500,
          ascending: 'n',
        },
        { instance: axiosInstance }
      )
      return parseBadBatteryFault(events)
    },
    {
      enabled: !!vehicleName,
      staleTime: 60 * 1000,
      refetchInterval: 30 * 1000,
    }
  )
}
