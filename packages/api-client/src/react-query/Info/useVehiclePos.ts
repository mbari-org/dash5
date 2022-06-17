import { useQuery } from 'react-query'
import { getVPos, GetVPosParams } from '../../axios'
import { useAuthContext } from '../AuthProvider'
import { SupportedQueryOptions } from '../types'

export const useVehiclePos = (
  params: GetVPosParams,
  options?: SupportedQueryOptions
) => {
  const { axiosInstance } = useAuthContext()
  const query = useQuery(
    ['info', 'vehicleNames', params],
    () => {
      return getVPos(params, {
        instance: axiosInstance,
      })
    },
    {
      staleTime: 30 * 1000,
      ...options,
    }
  )
  return query
}
