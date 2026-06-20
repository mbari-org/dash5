import {
  SelectField,
  AbsoluteOverlay,
  AccordionCells,
  ToolTip,
} from '@mbari/react-ui'
import useGlobalModalId from '../lib/useGlobalModalId'
import dynamic from 'next/dynamic'
import { useEffect, useMemo, useRef, useState } from 'react'
import { capitalize, humanize, swallow } from '@mbari/utils'
import { usePersistentState } from '../lib/usePersistentState'
import {
  TimeWindow,
  TIME_WINDOW_OPTIONS,
  getWindowFrom,
} from '../lib/timeWindows'
import {
  useChartData,
  useDeploymentChartData,
  useEvents,
  EventType,
} from '@mbari/api-client'
import { DateTime } from 'luxon'
import clsx from 'clsx'

const LineChart: any = dynamic(
  () => import('@mbari/react-ui/dist/Charts/LineChart'),
  {
    ssr: false,
  }
)

const vehicleUnits = ['arcdeg', 'deg', 'm', 's', 'v', 'rad', 'ma', 'ah']

export const ScienceCell: React.FC<{
  color: string
  name: string
  unit: string
  values?: number[]
  times?: number[]
  timeout?: number
  cellHeightClassname?: string
  chartHeightClassname?: string
  xAxisRange?: [number, number]
}> = ({
  color,
  values,
  times,
  unit,
  name,
  timeout: timeoutms,
  cellHeightClassname = 'h-[340px]',
  chartHeightClassname = 'h-[320px]',
  xAxisRange,
}) => {
  const [ready, setReady] = useState(false)
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    if (!ready && !timeout.current) {
      timeout.current = setTimeout(() => {
        setReady(true)
      }, timeoutms ?? 2000)
    }
    return () => {
      // Reset timeout.current so that a remount (e.g. React Strict Mode's
      // artificial unmount/remount cycle) can schedule a fresh timer.
      if (timeout.current) {
        clearTimeout(timeout.current)
        timeout.current = null
      }
    }
  }, [ready, timeout, setReady, timeoutms])

  const metric = `${capitalize(name)} (${unit})`
  const chart = useMemo(() => {
    return ready ? (
      <LineChart
        data={values?.map((v, i) => ({
          timestamp: times?.[i],
          value: v,
        }))}
        title={humanize(metric)}
        color={color}
        name={metric}
        className="absolute inset-0 w-full"
        inverted={name === 'depth'}
        xAxisRange={xAxisRange}
      />
    ) : (
      <AbsoluteOverlay />
    )
  }, [values, times, color, metric, name, ready, xAxisRange])
  return (
    <div
      className={clsx(
        cellHeightClassname,
        'w-full border-b border-b-slate-200 p-4'
      )}
    >
      <div className={clsx(chartHeightClassname, 'relative my-auto')}>
        {chart}
      </div>
    </div>
  )
}

const ScienceDataSection: React.FC<{
  vehicleName: string
  /** True deployment start (unixTime from startEvent). Used for logset/event
   *  queries and window calculations so they are scoped to the exact deployment.
   *  Falls back to `from` when not provided. */
  deploymentFrom?: number
  /** Adjusted query start (may be offset back by 1 day for active deployments
   *  to capture in-flight data). Used as the data fetch lower bound. */
  from: number
  to?: number // milliseconds since epoch — deployment end
}> = ({ vehicleName, deploymentFrom: deploymentFromProp, from, to }) => {
  // Use the true deployment start for scoping queries; fall back to from
  // (adjusted start) when not provided so existing callers are unaffected.
  const deploymentFrom = deploymentFromProp ?? from
  const { setGlobalModalId } = useGlobalModalId()
  const [timeWindow, setTimeWindow] = usePersistentState<TimeWindow>(
    'scienceSection.timeWindow',
    'latest'
  )
  const [category, setCategory] = usePersistentState<string | null>(
    'scienceSection.category',
    'vehicle'
  )
  const [alignAxes, setAlignAxes] = usePersistentState<boolean>(
    'scienceSection.alignAxes',
    false
  )
  const [logsetTooltip, setLogsetTooltip] = useState(false)

  const isExtended = timeWindow !== 'latest'

  // Fetch logPath events to populate the logset picker (only in 'latest' mode).
  // Use deploymentFrom (true start) so we don't miss logsets from the beginning
  // of the deployment when `from` has been offset forward for active deployments.
  const { data: logPathEvents, isError: logPathError } = useEvents(
    {
      vehicles: [vehicleName],
      eventTypes: ['logPath'] as EventType[],
      from: deploymentFrom,
      to,
      limit: 200,
      ascending: 'n',
    },
    {
      enabled: !!vehicleName && !isExtended && deploymentFrom > 0,
      staleTime: 5 * 60 * 1000,
    }
  )

  const [selectedLogsetId, setSelectedLogsetId] = usePersistentState<
    string | null
  >('scienceSection.selectedLogsetId', null)

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

  // Resolve time bounds for 'latest' (logset-scoped) mode.
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
    // List is descending (newest first), so idx-1 is the next newer logset —
    // the selected logset ends when that newer one started.
    const next = idx >= 0 ? logPathEvents[idx - 1] : undefined
    return next ? next.unixTime : to
  }, [selectedLogsetId, logPathEvents, to])

  // Bucket now to the nearest minute so relative windows (3d/7d) stay bounded
  // on active deployments without changing the query key on every render.
  // The memo re-anchors at most once per minute as bucketedNow advances.
  const bucketedNow = Math.floor(DateTime.utc().toMillis() / 60_000) * 60_000
  const extendedFrom = useMemo(
    () => getWindowFrom(timeWindow, deploymentFrom, to, bucketedNow),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [timeWindow, deploymentFrom, to, bucketedNow]
  )

  // Wait until logsets are loaded (or confirmed absent/errored) and a logset
  // is selected before firing the chart query. This prevents a wasted fetch
  // with the fallback window followed by a refetch once logset auto-selection
  // runs. On error we treat logsets as unavailable so charts still render
  // using the fallback deployment window rather than staying permanently blank.
  const logsetReady =
    logPathError ||
    (logPathEvents !== undefined &&
      (logPathEvents.length === 0 || selectedLogsetId !== null))

  const latestQuery = useChartData(
    { vehicle: vehicleName, from: logsetFrom, to: logsetTo },
    { enabled: !isExtended && logsetReady }
  )

  // For active deployments `to` is future-padded; treat it as open-ended
  // (undefined) so the query key is stable across renders. For ended
  // deployments `to` is in the past and is passed through unchanged.
  const clampedTo =
    to != null && to <= DateTime.utc().toMillis() ? to : undefined

  const deploymentQuery = useDeploymentChartData(
    {
      vehicle: vehicleName,
      deploymentFrom,
      from: extendedFrom,
      to: clampedTo,
    },
    { enabled: isExtended }
  )

  const {
    data: chartData,
    isLoading: queryIsLoading,
    isError,
    error,
  } = isExtended ? deploymentQuery : latestQuery

  // While logsets are still loading / auto-selecting, latestQuery is disabled
  // (isLoading = false). Treat that wait as loading so the empty-state message
  // doesn't appear prematurely before any data has been fetched.
  const isLoading = queryIsLoading || (!isExtended && !logsetReady)

  const charts = chartData?.filter((d) =>
    category === 'vehicle'
      ? vehicleUnits.includes(d.units.toLowerCase())
      : !vehicleUnits.includes(d.units.toLowerCase())
  )

  // Shared time domain for axis alignment — use the selected window bounds
  // directly so all charts span the exact same period regardless of when
  // individual sensors started recording within that window.
  const sharedXRange = useMemo((): [number, number] | undefined => {
    if (!alignAxes) return undefined
    // Clamp all end times to now so charts never extend into the future.
    const now = DateTime.utc().toMillis()
    if (!isExtended) {
      // Latest Dive: align to the selected logset's start → end
      return [logsetFrom, Math.min(logsetTo ?? now, now)]
    } else {
      // 3d / 7d / Full Deployment: align to the extended window
      return [extendedFrom, Math.min(to ?? now, now)]
    }
  }, [alignAxes, isExtended, logsetFrom, logsetTo, extendedFrom, to])

  const cellAtIndex = (index: number) => {
    const item = charts?.[index]
    return (
      <ScienceCell
        color="#666"
        unit={item?.units ?? ''}
        name={item?.name ?? 'Unknown'}
        values={item?.values}
        times={item?.times}
        xAxisRange={sharedXRange}
      />
    )
  }

  const handleespSamples = swallow(() => {
    setGlobalModalId({ id: 'espSamples' })
  })

  return (
    <>
      <header className="flex flex-wrap gap-2 p-2">
        <SelectField
          name="category"
          value={category ?? ''}
          options={[
            { id: 'vehicle', name: 'Vehicle' },
            { id: 'science', name: 'Science' },
          ]}
          onSelect={setCategory}
          className="my-auto"
        />
        <div
          title="Select how far back to display chart data. 'Latest Dive' shows the current log session only; other options pull data across multiple log sessions."
          className="my-auto min-w-[10rem]"
        >
          <SelectField
            name="timeWindow"
            value={timeWindow}
            options={TIME_WINDOW_OPTIONS}
            onSelect={(v) => setTimeWindow((v ?? 'latest') as TimeWindow)}
            aria-label="Chart time window"
          />
        </div>
        {!isExtended && logsetOptions.length > 0 && (
          <div
            className="relative my-auto"
            onMouseEnter={() => setLogsetTooltip(true)}
            onMouseLeave={() => setLogsetTooltip(false)}
          >
            <SelectField
              name="logset"
              placeholder="Logset"
              value={selectedLogsetId ?? ''}
              options={logsetOptions}
              onSelect={setSelectedLogsetId}
            />
            <ToolTip
              label="Select a logset to scope the charts to that time window"
              direction="below"
              active={logsetTooltip}
            />
          </div>
        )}
        <button
          title={
            alignAxes
              ? 'Click to let each chart auto-fit its own time axis'
              : 'Click to lock all charts to the same time axis for side-by-side comparison'
          }
          className={clsx(
            'my-auto rounded border px-3 py-1.5 text-sm font-medium transition-colors',
            alignAxes
              ? 'border-blue-300 bg-blue-50 text-blue-700'
              : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-50'
          )}
          type="button"
          aria-pressed={alignAxes}
          onClick={() => setAlignAxes((v) => !v)}
        >
          {alignAxes ? 'Best X-Axes Fit' : 'Align X-Axes'}
        </button>
        <button
          className="my-auto ml-auto px-4 py-2 font-bold text-violet-800"
          onClick={handleespSamples}
        >
          ESP Samples
        </button>
      </header>
      <div className="relative flex h-full flex-shrink flex-grow">
        <div className="absolute inset-0 w-full overflow-auto">
          {isLoading && (
            <div className="absolute inset-0 flex">
              <p className="m-auto rounded border border-slate-200 py-2 px-4 font-bold">
                Loading...
              </p>
            </div>
          )}
          {isError && (
            <div className="m-2 rounded bg-red-200 p-2 text-red-700">
              <p className="font-bold">
                Vehicle and Science data could not be processed for this
                dataset.
              </p>
              <p className="mt-1">
                This may be caused by invalid or malformed data in{' '}
                <span className="font-mono font-bold">chartData2.json</span>.
                Please ask a TethysDash administrator to reprocess this dataset.
              </p>
              {(error as Error)?.message && (
                <p className="mt-1 font-mono text-xs opacity-75">
                  {(error as Error).message}
                </p>
              )}
            </div>
          )}
          {!isLoading && !isError && !charts?.length && (
            <p className="m-4 text-sm text-stone-500">
              {chartData?.length
                ? `No ${
                    category ?? 'vehicle'
                  } data for this time window. Try switching to ${
                    category === 'vehicle' ? 'Science' : 'Vehicle'
                  }.`
                : 'No chart data available for this time window. Try a wider range or check back after the vehicle surfaces.'}
            </p>
          )}
          <AccordionCells
            cellAtIndex={cellAtIndex}
            count={charts?.length}
            loading={isLoading}
          />
        </div>
      </div>
    </>
  )
}

export default ScienceDataSection
