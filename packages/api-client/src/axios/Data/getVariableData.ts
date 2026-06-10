import { getInstance } from '../getInstance'
import { RequestConfig } from '../types'

export interface GetVariableDataParams {
  vehicle: string
  variableName: string
  from: number // milliseconds since epoch
  to?: number // milliseconds since epoch
  maxlen?: number
}

export interface GetVariableDataResponse {
  name: string
  units: string
  values: number[]
  times: number[] // milliseconds since epoch
}

export const getVariableData = async (
  { vehicle, variableName, from, to, maxlen = 2000 }: GetVariableDataParams,
  { debug, instance = getInstance(), ...config }: RequestConfig = {}
) => {
  const url = `/data/${encodeURIComponent(variableName)}`

  if (debug) {
    console.debug(`GET ${url}`)
  }

  const params = new URLSearchParams({
    vehicle,
    maxlen: String(maxlen),
    from: String(from),
  })
  if (to != null) {
    params.set('to', String(to))
  }

  const response = await instance.get(`${url}?${params.toString()}`, config)
  return response.data as GetVariableDataResponse
}
