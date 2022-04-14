// Use scaffold axiosBase to generate the resources imported below.
import { getInstance } from '../getInstance'
import { RequestConfig } from '../types'

export interface GetLogFileParams {
  logfilePath: string
  tail: number
}

export interface GetLogFileResponse {
  data: string
}

export const getLogFile = async (
  { logfilePath, ...params }: GetLogFileParams,
  { debug, instance = getInstance() }: RequestConfig = {}
) => {
  const url = `/util/logger/file/${logfilePath}`

  if (debug) {
    console.debug(`GET ${url}`)
  }
  const qs = new URLSearchParams({ tail: params.tail.toString() })
  const response = await instance.get(`${url}?${qs}`)
  return response.data as GetLogFileResponse
}
