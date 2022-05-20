import { useQuery } from 'react-query'
import { getVehicleNames, GetVehicleNamesParams } from '../../axios'
import { useAuthContext } from '../AuthProvider'

export const useVehicleNames = (params: GetVehicleNamesParams) => {
  const { token, axiosInstance } = useAuthContext()
  const query = useQuery(
    ['vehicleNames', params],
    () => {
      return getVehicleNames(params, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        instance: axiosInstance,
      })
    },
    {
      enabled: (token?.length ?? 0) > 0,
    }
  )
  return query
}
