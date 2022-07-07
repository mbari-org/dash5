import { useQuery } from 'react-query'
import { tags, TagsParams } from '../../axios'
import { SupportedQueryOptions } from '../types'
import { useTethysApiContext } from '../TethysApiProvider'

export const useTags = (
  params: TagsParams,
  options?: SupportedQueryOptions
) => {
  const { axiosInstance } = useTethysApiContext()
  const query = useQuery(
    ['git', 'tags', params],
    () => {
      return tags(params, {
        instance: axiosInstance,
      })
    },
    {
      staleTime: 60 * 1000 * 5, // 1 hour
      ...options,
    }
  )
  return query
}
