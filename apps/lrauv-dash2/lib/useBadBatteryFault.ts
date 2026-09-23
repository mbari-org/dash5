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
  // Use the deployment launch time (preferred) or start time as the query
  // window. If neither is available yet (deployment still loading), keep `from`
  // undefined so the query stays disabled — this prevents a full-history
  // logFault scan that could surface a stale BAD BATT overlay from a prior
  // deployment before the correct window is known.
  const from =
    lastDeployment?.launchEvent?.unixTime ??
    lastDeployment?.startEvent?.unixTime ??
    undefined

  return useQuery(
    ['widget', 'badBatteryFault', vehicleName, from],
    async () => {
      const events = await getEvents(
        {
          vehicles: [vehicleName],
          eventTypes: ['logFault'],
          from: from as number,
          limit: 500,
          ascending: 'n',
        },
        { instance: axiosInstance }
      )
      return parseBadBatteryFault(events)
    },
    {
      // Do not run until we have a real deployment start time — querying with
      // from=1 would scan the vehicle's full history and can return a stale
      // BAD BATT fault from a previous deployment.
      enabled: !!vehicleName && from !== undefined,
      staleTime: 60 * 1000,
      refetchInterval: 30 * 1000,
    }
  )
}
