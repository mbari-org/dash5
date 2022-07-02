import { useQuery } from 'react-query'
import { getVehicleNames, GetVehicleNamesParams } from '../../axios'
import { useTethysApiContext } from '../TethysApiProvider'
import { SupportedQueryOptions } from '../types'

export const useVehicleNames = (
  params: GetVehicleNamesParams,
  options?: SupportedQueryOptions
) => {
  const { axiosInstance } = useTethysApiContext()
  const query = useQuery(
    ['info', 'vehicleNames', params],
    () => {
      return getVehicleNames(params, {
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
