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
      const raw = (result?.data as string) ?? ''
      let parsed: unknown
      try {
        // Try parsing without modification first — the happy path.
        parsed = JSON.parse(raw)
      } catch {
        // Some TethysDash versions emit numbers with a trailing decimal point
        // (e.g. `12345.`) which is valid in JavaScript but invalid JSON.
        // Only attempt sanitization after a parse failure so the regex never
        // mutates digit+dot sequences inside quoted string values in valid JSON.
        const sanitized = raw.replace(/(\d\.)(?=\D|$)/g, (m) => m + '0')
        try {
          parsed = JSON.parse(sanitized)
        } catch {
          throw new Error(
            `chartData2.json for ${vehicle} (${path}) could not be parsed — the file may be truncated or malformed on the TethysDash server.`
          )
        }
      }
      const chartData = (parsed as { chartData?: unknown })?.chartData
      if (!Array.isArray(chartData)) {
        throw new Error(
          `chartData2.json for ${vehicle} returned invalid data — please ask a TethysDash administrator to reprocess this dataset.`
        )
      }
      return chartData as ChartData[]
    },
    {
      staleTime: 5 * 60 * 1000,
      ...options,
      enabled:
        !!axiosInstance &&
        !!siteConfig?.appConfig?.external?.tethysdash &&
        !!path &&
        (options?.enabled ?? true),
    }
  )
  return query
}
