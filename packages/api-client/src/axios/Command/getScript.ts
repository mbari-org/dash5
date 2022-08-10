// Use scaffold axiosBase to generate the resources imported below.
import { getInstance } from '../getInstance'
import { RequestConfig } from '../types'

export interface GetScriptParams {
  deploymentPath: string
  path: string
  deploymentId: string
}

export interface latLonNamePair {
  latName: string
  lonName: string
}

export interface ScriptArgument {
  name: string
  value: string
  description: string
  unit: string
}

export interface ScriptInsert {
  id: string
  scriptArgs: ScriptArgument[]
}
export interface GetScriptResponse {
  id: string
  description?: string
  scriptArgs: ScriptArgument[]
  latLonNamePairs?: latLonNamePair[]
  inserts?: ScriptInsert[]
}

export const getScript = async (
  params: GetScriptParams,
  { debug, instance = getInstance(), ...config }: RequestConfig = {}
) => {
  const url = '/commands/script'

  if (debug) {
    console.debug(`GET ${url}`)
  }

  const response = await instance.get(
    `${url}?${new URLSearchParams({ ...params })}`,
    config
  )
  return response.data.result as GetScriptResponse
}
