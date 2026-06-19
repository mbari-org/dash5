import axios from 'axios'
import { getInstance } from '../getInstance'
import { RequestConfig } from '../types'

export interface GetVariableDataParams {
  vehicle: string
  variableName: string
  from: number // milliseconds since epoch
  to?: number // milliseconds since epoch
  maxlen?: number
  /** Return one sample every N seconds, evenly distributed across the window (TethysDash ≥ 4.99.80) */
  step?: number
}

export interface GetVariableDataResponse {
  name: string
  units: string
  values: number[]
  times: number[] // milliseconds since epoch
}

export const getVariableData = async (
  { vehicle, variableName, from, to, maxlen, step }: GetVariableDataParams,
  { debug, instance = getInstance(), ...config }: RequestConfig = {}
): Promise<GetVariableDataResponse | null> => {
  const url = `/data/${encodeURIComponent(variableName)}`

  if (debug) {
    console.debug(`GET ${url}`)
  }

  const params = new URLSearchParams({
    vehicle,
    from: String(from),
  })
  // Prefer step over maxlen when both are provided: step returns evenly
  // distributed samples across the full window (TethysDash ≥ 4.99.80),
  // whereas maxlen returns only the most recent N samples.
  if (step != null) {
    params.set('step', String(step))
  } else if (maxlen != null) {
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
