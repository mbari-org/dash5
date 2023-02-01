// Use scaffold axiosBase to generate the resources imported below.
import { getInstance } from '../getInstance'
import { RequestConfig } from '../types'

export interface GetCommandsResponse {
  commands: ApiCommand[]
  serviceTypes: string[]
  decimationTypes: string[]
}

export interface ApiCommand {
  advanced: boolean
  description: string
  keyword: string
  syntaxList: Syntax[]
}

export interface Syntax {
  argList: Arg[]
  help: string
}

export type ArgumentType =
  | 'ARG_FLOAT'
  | 'ARG_INT'
  | 'ARG_SECONDS'
  | 'ARG_QUOTED_STRING'
  | 'ARG_STRING'
  | 'ARG_REGEX'
  | 'ARG_TIMESTAMP'
  | 'ARG_TOKEN'
  | 'ARG_KEYWORD'
  | 'ARG_MISSION'
  | 'ARG_SERVICE_TYPE'
  | 'ARG_UNIT'
  | 'ARG_UNIVERSAL'
  | 'ARG_VARIABLE'
  | 'ARG_NONE'

export interface Arg {
  argType: ArgumentType
  keyword?: string
  required?: string
}

export const getCommands = async ({
  debug,
  instance = getInstance(),
  ...config
}: RequestConfig = {}) => {
  const url = '/commands'

  if (debug) {
    console.debug(`GET ${url}`)
  }

  const response = await instance.get(url, config)
  return response.data.result as GetCommandsResponse
}
