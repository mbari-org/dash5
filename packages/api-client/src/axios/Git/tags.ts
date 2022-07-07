// Use scaffold axiosBase to generate the resources imported below.
import { getInstance } from '../getInstance'
import { RequestConfig } from '../types'

export interface TagsParams {
  limit: number
}

export interface TagsResponse {
  tag: string
  author: string
  isoDate: string
}

export const tags = async (
  params: TagsParams,
  { debug, instance = getInstance(), ...config }: RequestConfig = {}
) => {
  const url = '/git/tags'

  if (debug) {
    console.debug(`GET ${url}`)
  }

  const response = await instance.get(
    `${url}?${new URLSearchParams({ limit: params.limit.toString() })}`,
    config
  )
  return response.data.result as TagsResponse[]
}
