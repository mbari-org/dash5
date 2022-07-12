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
    from: string
    to?: string
  },
  options?: SupportedQueryOptions
) => {
  const { axiosInstance, siteConfig, token } = useTethysApiContext()
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

  const reprocessParams = {
    vehicle,
    path,
    action: 'plot',
  }

  const query = useQuery(
    ['event', 'events', vehicle, 'realtime/sbdlogs', path],
    async () => {
      try {
        const result = await axiosInstance?.get(
          `${siteConfig?.appConfig.external.tethysdash}/data/${vehicle}/realtime/sbdlogs/${path}/chartData2.json`
        )
        return result?.data?.chartData as ChartData[]
      } catch (e) {
        await axiosInstance?.post(
          `${siteConfig?.appConfig.external.tethysdash}/dash/reprocess`,
          {
            headers: { Authorization: `Bearer ${token}` },
            params: reprocessParams,
          }
        )
        throw e
      }
    },
    {
      ...options,
      staleTime: 5 * 60 * 1000,
      enabled:
        !!siteConfig?.appConfig.external.tethysdash &&
        !!path &&
        options?.enabled,
    }
  )
  return query
}
