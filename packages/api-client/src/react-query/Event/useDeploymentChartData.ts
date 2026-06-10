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
      // Guard against firing with an invalid from timestamp (e.g. deployment
      // not yet loaded). TethysDash returns 400 for from=0 or near-epoch values.
      enabled:
        !!axiosInstance &&
        from > 1_000_000_000_000 &&
        (options?.enabled ?? true),
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

  // Collect whichever variable queries have already resolved so we can render
  // charts progressively rather than waiting for every variable to finish.
  const resolvedData: ChartData[] = variableQueries
    .map((q) => q.data)
    .filter((d): d is ChartData => d != null)

  // Show the full loading overlay only until we have at least one chart to
  // display. Once data starts arriving, `isFetching` tracks the remainder.
  const isLoading =
    eventsQuery.isLoading ||
    namesQuery.isLoading ||
    (variableQueries.some((q) => q.isLoading) && resolvedData.length === 0)

  const isFetching =
    eventsQuery.isFetching ||
    namesQuery.isFetching ||
    (variableQueries.some((q) => q.isLoading || q.isFetching) &&
      resolvedData.length > 0)

  const isError =
    eventsQuery.isError ||
    namesQuery.isError ||
    variableQueries.some((q) => q.isError)

  // Return undefined while loading (so the Loading overlay appears), then
  // partial results as they arrive, growing to the full set.
  const data: ChartData[] | undefined =
    resolvedData.length > 0 ? resolvedData : undefined

  return { data, isLoading, isFetching, isError }
}
