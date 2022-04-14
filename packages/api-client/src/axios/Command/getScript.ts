// Use scaffold axiosBase to generate the resources imported below.
import { getInstance } from '../getInstance'
import { RequestConfig } from '../types'

export interface GetScriptParams {
  deploymentPath: string
  path: string
  deploymentId: string
}

export interface GetScriptResponse {
  result: string
}

export const getScript = async (
  params: GetScriptParams,
  { debug, instance = getInstance() }: RequestConfig = {}
) => {
  const url = '/commands/script'

  if (debug) {
    console.debug(`GET ${url}`)
  }

  const response = await instance.get(
    `${url}?${new URLSearchParams({ ...params })}`
  )
  return response.data as GetScriptResponse
}
