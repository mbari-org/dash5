import { useQueries, useQuery } from 'react-query'
import { EventType, getEvents } from '../../axios'
import { getVariableData } from '../../axios/Data/getVariableData'
import { useTethysApiContext } from '../TethysApiProvider'
import { SupportedQueryOptions } from '../types'
import { ChartData } from './useChartData'

/**
 * Fetches chart data for a user-selected time window that may span multiple
 * log sessions (log restarts). Uses GET /api/data/{variableName} which
 * aggregates across dataProcessed events — unlike useChartData which loads
 * only the single most-recent chartData2.json file.
 *
 * The variable list is derived from the latest dataProcessed session so we
 * know which channels to request. Each variable is then fetched in parallel
 * over the broader time range.
 */
export const useDeploymentChartData = (
  {
    vehicle,
    from,
    to,
  }: {
    vehicle: string
    from: number // milliseconds since epoch — start of the desired window
    to?: number // milliseconds since epoch — end of the desired window
  },
  options?: SupportedQueryOptions
) => {
  const { axiosInstance, siteConfig } = useTethysApiContext()

  // Step 1 — find the latest dataProcessed event to get the variable name list
  const eventsParams = {
    vehicles: [vehicle],
    eventTypes: ['dataProcessed'] as EventType[],
    limit: 2,
    from,
    ...(to != null ? { to } : {}),
  }
  const eventsQuery = useQuery(
    ['deployment-chart', 'events', eventsParams],
    () => getEvents(eventsParams, { instance: axiosInstance }),
    {
      staleTime: 5 * 60 * 1000,
      retry: 5,
      ...options,
    }
  )

  const path = eventsQuery.data?.[0]?.path
  const tethysdash = siteConfig?.appConfig?.external?.tethysdash

  // Step 2 — load the latest chartData2.json just to get the variable names
  const namesQuery = useQuery(
    ['deployment-chart', 'names', vehicle, path],
    async () => {
      const result = await axiosInstance?.get(
        `${tethysdash}/data/${vehicle}/realtime/sbdlogs/${path}/chartData2.json`,
        { responseType: 'text', transformResponse: (d) => d }
      )
      const raw = (result?.data as string) ?? ''
      let parsed: unknown
      try {
        parsed = JSON.parse(raw)
      } catch {
        const sanitized = raw.replace(/(\d\.)(?=\D|$)/g, (m) => m + '0')
        parsed = JSON.parse(sanitized)
      }
      const chartData = (parsed as { chartData?: unknown })?.chartData
      if (!Array.isArray(chartData)) return [] as string[]
      return (chartData as ChartData[]).map((d) => d.name)
    },
    {
      staleTime: 5 * 60 * 1000,
      ...options,
      enabled:
        !!axiosInstance && !!tethysdash && !!path && (options?.enabled ?? true),
    }
  )

  const variableNames = namesQuery.data ?? []

  // Step 3 — fetch each variable over the full requested time range in parallel
  const variableQueries = useQueries(
    variableNames.map((variableName) => ({
      queryKey: [
        'deployment-chart',
        'variable',
        vehicle,
        variableName,
        from,
        to,
      ],
      queryFn: () =>
        getVariableData(
          { vehicle, variableName, from, ...(to != null ? { to } : {}) },
          { instance: axiosInstance }
        ),
      staleTime: 5 * 60 * 1000,
      enabled:
        !!axiosInstance &&
        variableNames.length > 0 &&
        (options?.enabled ?? true),
    }))
  )

  const isLoading =
    eventsQuery.isLoading ||
    namesQuery.isLoading ||
    variableQueries.some((q) => q.isLoading)

  const isFetching =
    eventsQuery.isFetching ||
    namesQuery.isFetching ||
    variableQueries.some((q) => q.isFetching)

  const isError =
    eventsQuery.isError ||
    namesQuery.isError ||
    variableQueries.some((q) => q.isError)

  const data: ChartData[] | undefined =
    variableNames.length > 0 && variableQueries.every((q) => q.data != null)
      ? variableQueries.map((q) => q.data as ChartData)
      : undefined

  return { data, isLoading, isFetching, isError }
}
