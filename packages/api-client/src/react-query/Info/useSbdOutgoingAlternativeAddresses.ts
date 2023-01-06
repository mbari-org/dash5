import { useQuery } from 'react-query'
import {
  getSbdOutgoingAlternativeAddresses,
  GetSbdOutgoingAlternativeAddressesParams,
} from '../../axios'
import { useTethysApiContext } from '../TethysApiProvider'
import { SupportedQueryOptions } from '../types'

export const useSbdOutgoingAlternativeAddresses = (
  params: GetSbdOutgoingAlternativeAddressesParams,
  options?: SupportedQueryOptions
) => {
  const { axiosInstance, token } = useTethysApiContext()
  const query = useQuery(
    ['info', 'sbdOutgoingAlternativeAddresses', params],
    () => {
      return getSbdOutgoingAlternativeAddresses(params, {
        instance: axiosInstance,
        headers: { Authorization: `Bearer ${token}` },
      })
    },
    {
      staleTime: 60 * 1000 * 60, // 1 hour
      ...options,
    }
  )
  return query
}
