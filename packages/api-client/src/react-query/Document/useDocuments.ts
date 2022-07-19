import { useQuery } from 'react-query'
import { getDocuments, GetDocumentsParams } from '../../axios'
import { useTethysApiContext } from '../TethysApiProvider'
import { SupportedQueryOptions } from '../types'

export const useDocuments = (
  params: GetDocumentsParams,
  options?: SupportedQueryOptions
) => {
  const { axiosInstance } = useTethysApiContext()

  const query = useQuery(
    ['document', 'documents', params],
    () => {
      return getDocuments(params, { instance: axiosInstance })
    },
    {
      staleTime: 5 * 60 * 1000,
      ...options,
    }
  )

  return query
}
