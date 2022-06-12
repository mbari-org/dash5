import { AxiosInstance } from 'axios'
import { useQuery } from 'react-query'
import { getVehicleInfo, GetVehicleInfoParams } from '../../axios'
import { useAuthContext } from '../AuthProvider'

/**
 * This endpoint does not come from the tethys API, instead it is a placeholder for the formal API and
 * is populate by the same cron job that generates the legacy SSR SVG diagrams for the V1 dash. I recommend
 * contacting the maintainer or referencing the code for said cron job here:
 * https://bitbucket.org/beroe/auvstatus/src/master/
 */
export const useVehicleInfo = (
  params: GetVehicleInfoParams,
  instance?: AxiosInstance
) => {
  const { axiosInstance } = useAuthContext()
  const query = useQuery(
    ['widget', params.name],
    () => {
      return getVehicleInfo(params, {
        instance: instance ?? axiosInstance,
      })
    },
    {
      staleTime: 60 * 1000,
    }
  )
  return query
}
