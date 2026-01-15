import { getInstance } from '../getInstance'
import { RequestConfig } from '../types'

export interface PostRuntimePlatformsParams {
  platformIds: string[]
}

export type PostRuntimePlatformsResponse = string[]

export const postRuntimePlatforms = async (
  params: PostRuntimePlatformsParams,
  {
    debug,
    instance = getInstance(),
    baseURL = '',
    ...config
  }: RequestConfig = {}
) => {
  const url = `${baseURL}/runtime/platforms`

  if (debug) {
    console.debug(`POST ${url}`)
  }

  const response = await instance.post(
    url,
    { platformIds: params.platformIds },
    config
  )
  return response.data as PostRuntimePlatformsResponse
}
