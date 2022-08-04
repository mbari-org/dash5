import {
  getPicAndOnCall,
  GetPicAndOnCallParams,
  GetPicAndOnCallResponse,
} from '../../axios'
import { useQuery } from 'react-query'
import { useTethysApiContext } from '../TethysApiProvider'
import { SupportedQueryOptions } from '../types'

interface UsePicAndOnCallParams
  extends Omit<GetPicAndOnCallParams, 'vehicleName'> {
  vehicleName: string | string[]
}

export const usePicAndOnCall = (
  params: UsePicAndOnCallParams,
  options?: SupportedQueryOptions
) => {
  const { axiosInstance, token } = useTethysApiContext()
  const query = useQuery(
    ['users', 'picAndOnCall', params],
    async () => {
      const config = {
        instance: axiosInstance,
        headers: { Authorization: `Bearer ${token}` },
      }

      let result: GetPicAndOnCallResponse[] = []
      if (typeof params.vehicleName === 'string') {
        result = [
          await getPicAndOnCall(
            { ...params, vehicleName: params.vehicleName as string },
            config
          ),
        ]
      } else {
        result = await Promise.all(
          params.vehicleName.map((vehicleName) =>
            getPicAndOnCall({ ...params, vehicleName }, config)
          )
        )
      }
      return result
    },
    {
      staleTime: 5 * 60 * 1000,
      ...options,
    }
  )
  return query
}
