import { AxiosInstance } from 'axios'
import { useQuery } from 'react-query'
import { tags, TagsParams } from '../../axios'
import { SupportedQueryOptions } from '../types'

export const useTags = (
  params: TagsParams,
  options?: SupportedQueryOptions,
  instance?: AxiosInstance
) => {
  const query = useQuery(
    ['git', 'tags', params],
    () => {
      return tags(params, {
        instance: instance,
      })
    },
    {
      staleTime: 60 * 1000 * 5, // 1 hour
      ...options,
    }
  )
  return query
}
