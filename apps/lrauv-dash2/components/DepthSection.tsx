import { SelectField, ToolTip } from '@mbari/react-ui'
import {
  useChartData,
  useEvents,
  EventType,
  getVariableData,
  useTethysApiContext,
} from '@mbari/api-client'
import dynamic from 'next/dynamic'
import { useEffect, useMemo, useState } from 'react'
import { useQuery } from 'react-query'
import { humanize } from '@mbari/utils'
import { DateTime } from 'luxon'
import clsx from 'clsx'
import { usePersistentState } from '../lib/usePersistentState'
import {
  TimeWindow,
  TIME_WINDOW_OPTIONS,
  getWindowFrom,
} from '../lib/timeWindows'

const LineChart: any = dynamic(
  () => import('@mbari/react-ui/dist/Charts/LineChart'),
  { ssr: false }
)

const DepthSection: React.FC<{
  vehicleName: string
  from: number
  to?: number
  onHover?: (millis?: number | null) => void
}> = ({ vehicleName, from, to, onHover }) => {
  const [timeWindow, setTimeWindow] = usePersistentState<TimeWindow>(
    'depthSection.timeWindow',
    'deployment'
  )
  const [logsetTooltip, setLogsetTooltip] = useState(false)

  const isExtended = timeWindow !== 'latest'

  const { data: logPathEvents } = useEvents(
    {
      vehicles: [vehicleName],
      eventTypes: ['logPath'] as EventType[],
      from,
      to,
      limit: 200,
      ascending: 'n',
    },
    { enabled: !!vehicleName && !isExtended, staleTime: 5 * 60 * 1000 }
  )

  const [selectedLogsetId, setSelectedLogsetId] = usePersistentState<
    string | null
  >('depthSection.selectedLogsetId', null)

  // Auto-select the latest logset; also reset if the persisted ID is no longer
  // valid for the current deployment (e.g. navigated to a different deployment).
  useEffect(() => {
    if (logPathEvents?.length) {
      const validIds = new Set(logPathEvents.map((e) => String(e.eventId)))
      if (!selectedLogsetId || !validIds.has(selectedLogsetId)) {
        setSelectedLogsetId(String(logPathEvents[0].eventId))
      }
    }
  }, [logPathEvents, selectedLogsetId, setSelectedLogsetId])

  const logsetOptions = useMemo(() => {
    if (!logPathEvents?.length) return []
    return logPathEvents.map((e) => ({
      id: String(e.eventId),
      name:
        DateTime.fromMillis(e.unixTime, { zone: 'utc' }).toFormat(
          'MMM d, yyyy HH:mm'
        ) + ' UTC',
    }))
  }, [logPathEvents])

  const logsetFrom = useMemo(() => {
    if (!selectedLogsetId || !logPathEvents?.length) return from
    const idx = logPathEvents.findIndex(
      (e) => String(e.eventId) === selectedLogsetId
    )
    return idx >= 0 ? logPathEvents[idx].unixTime : from
  }, [selectedLogsetId, logPathEvents, from])

  const logsetTo = useMemo(() => {
    if (!selectedLogsetId || !logPathEvents?.length) return to
    const idx = logPathEvents.findIndex(
      (e) => String(e.eventId) === selectedLogsetId
    )
    const next = idx >= 0 ? logPathEvents[idx - 1] : undefined
    return next ? next.unixTime : to
  }, [selectedLogsetId, logPathEvents, to])

  // Bucket now to the nearest minute so relative windows (3d/7d) stay bounded
  // on active deployments without changing the query key on every render.
  const bucketedNow = Math.floor(DateTime.utc().toMillis() / 60_000) * 60_000
  const extendedFrom = useMemo(
    () => getWindowFrom(timeWindow, from, to, bucketedNow),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [timeWindow, from, to, bucketedNow]
  )

  const latestQuery = useChartData(
    { vehicle: vehicleName, from: logsetFrom, to: logsetTo },
    { enabled: !isExtended }
  )

  // For extended windows fetch only the depth variable directly — using
  // useDeploymentChartData would trigger one request per variable in
  // chartData2.json (potentially dozens), which is wasteful when we only
  // need depth.
  // For active deployments `to` is future-padded; treat it as open-ended
  // (undefined) so the query key is stable across renders. For ended
  // deployments `to` is in the past and is passed through unchanged.
  const now = DateTime.utc().toMillis()
  const clampedTo = to != null && to <= now ? to : undefined
  const windowMs = (clampedTo ?? now) - extendedFrom
  const step = Math.max(1, Math.round(windowMs / 1000 / 2000))

  const { axiosInstance } = useTethysApiContext()
  const depthQuery = useQuery(
    ['depth-section', vehicleName, extendedFrom, clampedTo, step],
    () =>
      getVariableData(
        {
          vehicle: vehicleName,
          variableName: 'depth',
          from: extendedFrom,
          to: clampedTo,
          step,
        },
        { instance: axiosInstance ?? undefined }
      ),
    {
      enabled: isExtended && !!axiosInstance && extendedFrom > 0,
      staleTime: 5 * 60 * 1000,
    }
  )

  const latestChartData = latestQuery.data
  const depthData = isExtended
    ? depthQuery.data ?? undefined
    : latestChartData?.find((d) => d.name === 'depth')

  const isLoading = isExtended ? depthQuery.isLoading : latestQuery.isLoading
  const isError = isExtended ? depthQuery.isError : latestQuery.isError
  const chartAvailable = !!depthData && !isLoading && !isError

  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      <header className="flex flex-wrap items-center gap-2 px-4 pt-1">
        <div
          title="Select how far back to display depth data. 'Latest Dive' shows the current log session only."
          className="min-w-[10rem]"
        >
          <SelectField
            name="depthTimeWindow"
            value={timeWindow}
            options={TIME_WINDOW_OPTIONS}
            onSelect={(v) => setTimeWindow((v ?? 'latest') as TimeWindow)}
            aria-label="Depth chart time window"
          />
        </div>
        {!isExtended && logsetOptions.length > 0 && (
          <div
            className="relative"
            onMouseEnter={() => setLogsetTooltip(true)}
            onMouseLeave={() => setLogsetTooltip(false)}
          >
            <SelectField
              name="depthLogset"
              placeholder="Logset"
              value={selectedLogsetId ?? ''}
              options={logsetOptions}
              onSelect={setSelectedLogsetId}
            />
            <ToolTip
              label="Select a logset to scope the depth chart to that dive"
              direction="below"
              active={logsetTooltip}
            />
          </div>
        )}
        {isLoading && (
          <p className={clsx('text-sm font-medium text-slate-500')}>Loading…</p>
        )}
        {isError && (
          <p className="text-sm font-medium text-red-600">
            Depth data could not be loaded
          </p>
        )}
      </header>
      <div className="min-h-0 flex-1 px-4 pb-1">
        {!isLoading && !isError && !chartAvailable && (
          <p className="mt-4 text-center text-sm text-slate-500">
            No depth data available for this time window.
          </p>
        )}
        {chartAvailable && (
          <LineChart
            name={depthData.name}
            data={depthData.values?.map((v: number, i: number) => ({
              value: v,
              timestamp: depthData.times?.[i],
            }))}
            yAxisLabel={`${humanize(depthData.name)} (${depthData.units})`}
            onHover={onHover}
            inverted
            className="h-full w-full"
          />
        )}
      </div>
    </div>
  )
}

export default DepthSection
