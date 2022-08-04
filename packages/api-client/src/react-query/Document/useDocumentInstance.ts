import { useQuery } from 'react-query'
import { getDocumentInstance, GetDocumentInstanceParams } from '../../axios'
import { useTethysApiContext } from '../TethysApiProvider'
import { SupportedQueryOptions } from '../types'

export const useDocumentInstance = (
  params: GetDocumentInstanceParams,
  options?: SupportedQueryOptions
) => {
  const { axiosInstance } = useTethysApiContext()

  const query = useQuery(
    ['document', 'documents', 'instance', params],
    () => {
      return getDocumentInstance(params, { instance: axiosInstance })
    },
    {
      staleTime: 5 * 60 * 1000,
      ...options,
    }
  )

  return query
}
