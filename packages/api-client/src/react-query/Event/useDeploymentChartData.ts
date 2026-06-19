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
 * `deploymentFrom` is the deployment start time used to look up the variable
 * name list. It must span the full deployment so we always find a dataProcessed
 * event even when the vehicle is mid-dive and hasn't processed data within the
 * user-selected window (e.g. "24 Hours" during a long dive).
 *
 * `from` / `to` control only the time range of the actual data fetch.
 */
export const useDeploymentChartData = (
  {
    vehicle,
    deploymentFrom,
    from,
    to,
  }: {
    vehicle: string
    deploymentFrom: number // deployment start — used to find the variable list
    from: number // milliseconds since epoch — start of the desired data window
    to?: number // milliseconds since epoch — end of the desired data window
  },
  options?: SupportedQueryOptions
) => {
  const { axiosInstance, siteConfig } = useTethysApiContext()

  // Step 1 — find the latest dataProcessed event to get the variable name list.
  // Always search from the deployment start (not the selected window) so short
  // windows like "24 Hours" still resolve variable names when the vehicle hasn't
  // processed data recently (e.g. it is currently mid-dive).
  const eventsParams = {
    vehicles: [vehicle],
    eventTypes: ['dataProcessed'] as EventType[],
    limit: 2,
    from: deploymentFrom,
    ...(to != null ? { to } : {}),
  }
  const eventsQuery = useQuery(
    ['deployment-chart', 'events', vehicle, deploymentFrom, to],
    () => getEvents(eventsParams, { instance: axiosInstance }),
    {
      staleTime: 5 * 60 * 1000,
      retry: 1,
      ...options,
      // Guard against firing with an invalid from timestamp (e.g. deployment
      // not yet loaded). TethysDash returns 400 for from=0 or near-epoch values.
      enabled:
        !!axiosInstance &&
        deploymentFrom > 1_000_000_000_000 &&
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
        // chartData2.json sometimes contains trailing-decimal floats (e.g. "1.")
        // that are invalid JSON. Try once more after patching them.
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
          `chartData2.json for ${vehicle} (${path}) returned invalid data — please ask a TethysDash administrator to reprocess this dataset.`
        )
      }
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

  // For short windows (≤ 4 days) cap at 2000 points to keep requests fast.
  // For longer windows omit maxlen entirely so TethysDash returns all available
  // data — TethysDash returns the most recent N samples when maxlen is set, so
  // capping a long window truncates to only recent data (e.g. depth sampled
  // every 5s fills 2000 points in ~3 hours). Results are decimated below.
  const windowMs = (to ?? Date.now()) - from
  const windowDays = windowMs / (24 * 60 * 60 * 1000)
  const maxlen = windowDays <= 4 ? 2000 : undefined

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
          {
            vehicle,
            variableName,
            from,
            maxlen,
            ...(to != null ? { to } : {}),
          },
          { instance: axiosInstance }
        ),
      staleTime: 5 * 60 * 1000,
      ...options,
      enabled:
        !!axiosInstance &&
        variableNames.length > 0 &&
        (options?.enabled ?? true),
    }))
  )

  // Collect whichever variable queries have already resolved so we can render
  // charts progressively. `null` means the variable had no data in the window
  // (404 from TethysDash) — filter those out silently rather than treating as
  // an error, since other variables in the same window may still have data.
  // For long windows we omit maxlen so TethysDash returns all data; decimate
  // client-side to a target of 5000 points to keep charts responsive.
  const TARGET_POINTS = 5000
  const resolvedData: ChartData[] = variableQueries
    .map((q) => q.data)
    .filter((d): d is ChartData => d != null && d !== null)
    .map((d) => {
      if (d.values.length <= TARGET_POINTS) return d
      const stride = Math.ceil(d.values.length / TARGET_POINTS)
      return {
        ...d,
        values: d.values.filter((_, i) => i % stride === 0),
        times: d.times.filter((_, i) => i % stride === 0),
      }
    })

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

  const error =
    eventsQuery.error ??
    namesQuery.error ??
    variableQueries.find((q) => q.error)?.error ??
    null

  return { data, isLoading, isFetching, isError, error }
}
