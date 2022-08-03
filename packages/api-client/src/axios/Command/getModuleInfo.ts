// Use scaffold axiosBase to generate the resources imported below.
import { getInstance } from '../getInstance'
import { RequestConfig } from '../types'

export interface GetModuleInfoResponse {
  moduleNames: string[]
  behaviors: Component
  configUris: Module
  outputUris: Module
  sensors: Component
  settingUris: Module
  uris: Module
  uriStringSettings: Module
}

interface Element {
  string: string
  description?: string
}

interface Component {
  [key: string]: Element[]
}

interface Module {
  [key: string]: Component
}

export const getModuleInfo = async ({
  debug,
  instance = getInstance(),
  ...config
}: RequestConfig = {}) => {
  const url = '/commands/moduleInfo'

  if (debug) {
    console.debug(`GET ${url}`)
  }

  const response = await instance.get(url, config)
  return response.data.result as GetModuleInfoResponse
}
