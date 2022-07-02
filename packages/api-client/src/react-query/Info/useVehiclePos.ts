import { useQuery } from 'react-query'
import { getVPos, GetVPosParams } from '../../axios'
import { useTethysApiContext } from '../TethysApiProvider'
import { SupportedQueryOptions } from '../types'

export const useVehiclePos = (
  params: GetVPosParams,
  options?: SupportedQueryOptions
) => {
  const { axiosInstance } = useTethysApiContext()
  const query = useQuery(
    ['info', 'vehiclePos', params],
    () => {
      return getVPos(params, {
        instance: axiosInstance,
      })
    },
    {
      staleTime: 5 * 60 * 1000,
      ...options,
    }
  )
  return query
}
