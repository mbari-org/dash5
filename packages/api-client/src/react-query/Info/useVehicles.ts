import { useQuery } from 'react-query'
import { getVehicles, GetVehiclesParams } from '../../axios'
import { useAuthContext } from '../AuthProvider'

export const useVehicles = (params: GetVehiclesParams) => {
  const { axiosInstance } = useAuthContext()
  const query = useQuery(
    ['info', 'vehicleNames', params],
    () => {
      return getVehicles(params, {
        instance: axiosInstance,
      })
    },
    {
      staleTime: 30 * 1000,
    }
  )
  return query
}
