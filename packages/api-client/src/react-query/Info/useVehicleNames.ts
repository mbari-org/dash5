import { useQuery } from 'react-query'
import { getVehicleNames, GetVehicleNamesParams } from '../../axios'
import { useAuthContext } from '../AuthProvider'

export const useVehicleNames = (params: GetVehicleNamesParams) => {
  const { axiosInstance } = useAuthContext()
  const query = useQuery(
    ['info', 'vehicleNames', params],
    () => {
      return getVehicleNames(params, {
        instance: axiosInstance,
      })
    },
    {
      staleTime: 30 * 1000,
    }
  )
  return query
}
