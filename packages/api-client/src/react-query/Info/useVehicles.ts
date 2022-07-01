import { useQuery } from 'react-query'
import { getVehicles, GetVehiclesParams } from '../../axios'
import { useTethysApiContext } from '../TethysApiProvider'
import { SupportedQueryOptions } from '../types'

export const useVehicles = (
  params: GetVehiclesParams,
  options?: SupportedQueryOptions
) => {
  const { axiosInstance } = useTethysApiContext()
  const query = useQuery(
    ['info', 'vehicleNames', params],
    () => {
      return getVehicles(params, {
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
