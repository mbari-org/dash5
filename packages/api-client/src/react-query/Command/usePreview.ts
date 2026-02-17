import { useQuery } from 'react-query'
import { getPreview, GetPreviewParams } from '../../axios'
import { useTethysApiContext } from '../TethysApiProvider'
import { SupportedQueryOptions } from '../types'

export const usePreview = (
  params: GetPreviewParams,
  options?: SupportedQueryOptions
) => {
  const { axiosInstance, token } = useTethysApiContext()
  const query = useQuery(
    ['commands', 'preview', params],
    () => {
      return getPreview(params, {
        instance: axiosInstance,
        headers: { Authorization: `Bearer ${token}` },
      })
    },
    {
      staleTime: 60 * 1000,
      ...options,
    }
  )
  return query
}
