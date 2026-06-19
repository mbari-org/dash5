import axios from 'axios'
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
  { vehicle, variableName, from, to, maxlen }: GetVariableDataParams,
  { debug, instance = getInstance(), ...config }: RequestConfig = {}
) => {
  const url = `/data/${encodeURIComponent(variableName)}`

  if (debug) {
    console.debug(`GET ${url}`)
  }

  const params = new URLSearchParams({
    vehicle,
    from: String(from),
  })
  // Only include maxlen when specified — omitting it lets TethysDash return
  // all available points, which is needed for long windows where a cap would
  // truncate to only the most recent N samples.
  if (maxlen != null) {
    params.set('maxlen', String(maxlen))
  }
  if (to != null) {
    params.set('to', String(to))
  }

  try {
    const response = await instance.get(`${url}?${params.toString()}`, config)
    return response.data as GetVariableDataResponse
  } catch (err) {
    // TethysDash returns 404 when a variable has no data in the requested
    // time range. Treat this as "no data" rather than a hard error so the
    // chart is simply omitted rather than causing the entire section to fail.
    if (axios.isAxiosError(err) && err.response?.status === 404) {
      return null
    }
    throw err
  }
}
