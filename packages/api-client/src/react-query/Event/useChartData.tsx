import { useQuery } from 'react-query'
import { EventType, getEvents } from '../../axios'
import { useTethysApiContext } from '../TethysApiProvider'
import { SupportedQueryOptions } from '../types'

export interface ChartData {
  name: string
  values: number[]
  times: number[]
  units: string
}

export const useChartData = (
  {
    vehicle,
    ...params
  }: {
    vehicle: string
    from: number // milliseconds since epoch
    to?: number // milliseconds since epoch
  },
  options?: SupportedQueryOptions
) => {
  const { axiosInstance, siteConfig } = useTethysApiContext()
  const updatedParams = {
    ...params,
    vehicles: [vehicle],
    eventTypes: ['dataProcessed'] as EventType[],
    limit: 2,
  }
  const events = useQuery(
    ['event', 'events', updatedParams],
    () => {
      return getEvents(updatedParams, {
        instance: axiosInstance,
      })
    },
    {
      staleTime: 5 * 60 * 1000,
      retry: 5,
      ...options,
    }
  )

  const path = events?.data?.[0]?.path

  const query = useQuery(
    ['event', 'events', vehicle, 'realtime/sbdlogs', path],
    async () => {
      const result = await axiosInstance?.get(
        `${siteConfig?.appConfig?.external?.tethysdash}/data/${vehicle}/realtime/sbdlogs/${path}/chartData2.json`,
        // Fetch as raw text so we can sanitize malformed numbers before parsing.
        { responseType: 'text', transformResponse: (data) => data }
      )
      // Some TethysDash versions emit numbers with a trailing decimal point
      // (e.g. `12345.`) which is valid in JavaScript but invalid JSON.
      // Normalise them to `12345.0` before parsing.
      const sanitized = ((result?.data as string) ?? '').replace(
        /(\d\.)(?=\D|$)/g,
        '$10'
      )
      let parsed: unknown
      try {
        parsed = JSON.parse(sanitized)
      } catch {
        throw new Error(
          `chartData2.json for ${vehicle} (${path}) could not be parsed — the file may be truncated or malformed on the TethysDash server.`
        )
      }
      const chartData = (parsed as { chartData?: unknown })?.chartData
      if (!Array.isArray(chartData)) {
        throw new Error(
          `chartData2.json for ${vehicle} returned invalid data — TethysDash may need to reprocess this mission.`
        )
      }
      return chartData as ChartData[]
    },
    {
      ...options,
      staleTime: 5 * 60 * 1000,
      enabled:
        !!siteConfig?.appConfig?.external?.tethysdash &&
        !!path &&
        (options?.enabled ?? true),
    }
  )
  return query
}
