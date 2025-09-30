import { useQuery } from 'react-query'
import { getWaypoints, GetWaypointsParams } from '../../axios'
import { useTethysApiContext } from '../TethysApiProvider'
import { SupportedQueryOptions } from '../types'

export const useWaypointsInfo = (
  params: GetWaypointsParams,
  options?: SupportedQueryOptions
) => {
  const { axiosInstance } = useTethysApiContext()
  return useQuery(
    ['waypoints', params.vehicle, params.to],
    () => getWaypoints(params, { instance: axiosInstance }),
    {
      staleTime: 60 * 1000,
      ...options,
    }
  )
}
