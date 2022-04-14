// Use scaffold axiosBase to generate the resources imported below.
import { getInstance } from '../getInstance'
import { RequestConfig } from '../types'

export interface GetFrequentRunsParams {
  vehicle: string
}

export interface GetFrequentRunsResponse {
  result: string
}

export const getFrequentRuns = async (
  params: GetFrequentRunsParams,
  { debug, instance = getInstance() }: RequestConfig = {}
) => {
  const url = '/commands/frequent/runs'

  if (debug) {
    console.debug(`GET ${url}`)
  }

  const response = await instance.get(
    `${url}?${new URLSearchParams({ ...params })}`
  )
  return response.data as GetFrequentRunsResponse
}
