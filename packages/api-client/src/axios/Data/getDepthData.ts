import { getInstance } from '../getInstance'
import { RequestConfig } from '../types'

export interface GetDepthDataParams {
  vehicle: string
  from: number // milliseconds since epoch
  maxlen?: number
}

export interface GetDepthDataResponse {
  values: number[]
  times: number[] // milliseconds since epoch
}

export const getDepthData = async (
  { vehicle, from, maxlen = 2000 }: GetDepthDataParams,
  { debug, instance = getInstance(), ...config }: RequestConfig = {}
) => {
  const url = `/data/depth`

  if (debug) {
    console.debug(`GET ${url}`)
  }

  const params = new URLSearchParams({
    vehicle,
    maxlen: String(maxlen),
    from: String(from),
  })
  const response = await instance.get(`${url}?${params.toString()}`, config)
  return response.data as GetDepthDataResponse
}
