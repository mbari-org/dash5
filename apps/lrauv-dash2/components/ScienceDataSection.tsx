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
  title?: string
  color: string
  name: string
  unit: string
  values?: number[]
  times?: number[]
  timeout?: number
  cellHeightClassname?: string
  chartHeightClassname?: string
}> = ({
  color,
  values,
  times,
  unit,
  name,
  timeout: timeoutms,
  cellHeightClassname = 'h-[340px]',
  chartHeightClassname = 'h-[320px]',
}) => {
  const [ready, setReady] = useState(false)
  const timeout = useRef<ReturnType<typeof setTimeout>>(null)
  useEffect(() => {
    if (!ready && !timeout.current) {
      setTimeout(() => {
        setReady(true)
      }, timeoutms ?? 2000)
    }
    const currentTimeout = timeout.current
    return () => {
      if (currentTimeout) {
        clearTimeout(currentTimeout)
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
      />
    ) : (
      <AbsoluteOverlay />
    )
  }, [values, times, color, metric, name, ready])
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

type TimeWindow = 'latest' | '3d' | '7d' | 'deployment'

const TIME_WINDOW_OPTIONS: { id: TimeWindow; name: string }[] = [
  { id: 'latest', name: 'Latest Dive' },
  { id: '3d', name: '3 Days' },
  { id: '7d', name: '7 Days' },
  { id: 'deployment', name: 'Full Deployment' },
]

const getWindowFrom = (
  window: TimeWindow,
  deploymentFrom: number,
  deploymentTo?: number
): number => {
  // For ended deployments `deploymentTo` is in the past, so relative windows
  // (3d/7d) must be computed from the end of the deployment, not from now.
  // Clamp the result so it is never earlier than the deployment start.
  const anchor = deploymentTo ?? DateTime.utc().toMillis()
  switch (window) {
    case '3d':
      return Math.max(deploymentFrom, anchor - 3 * 24 * 60 * 60 * 1000)
    case '7d':
      return Math.max(deploymentFrom, anchor - 7 * 24 * 60 * 60 * 1000)
    case 'deployment':
      return deploymentFrom
    default:
      return deploymentFrom
  }
}

const ScienceDataSection: React.FC<{
  vehicleName: string
  from: number // milliseconds since epoch — deployment start
  to?: number // milliseconds since epoch — deployment end
}> = ({ vehicleName, from, to }) => {
  const { setGlobalModalId } = useGlobalModalId()
  const [timeWindow, setTimeWindow] = useState<TimeWindow>('latest')
  const [category, setCategory] = useState<string | null>('vehicle')
  const [logsetTooltip, setLogsetTooltip] = useState(false)

  const isExtended = timeWindow !== 'latest'

  // Fetch logPath events to populate the logset picker (only in 'latest' mode).
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

  // null until logPath events load; auto-select the latest logset once available.
  const [selectedLogsetId, setSelectedLogsetId] = useState<string | null>(null)

  useEffect(() => {
    if (!selectedLogsetId && logPathEvents?.length) {
      setSelectedLogsetId(String(logPathEvents[0].eventId))
    }
  }, [logPathEvents, selectedLogsetId])

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

  // Memoize so the query key stays stable across re-renders. Without this,
  // DateTime.utc() returns a new millisecond value on every render, which
  // changes the query key and causes React Query to treat each render as a
  // brand-new query — keeping isLoading permanently true.
  const extendedFrom = useMemo(
    () => getWindowFrom(timeWindow, from, to),
    [timeWindow, from, to]
  )

  const latestQuery = useChartData(
    { vehicle: vehicleName, from: logsetFrom, to: logsetTo },
    { enabled: !isExtended }
  )

  const deploymentQuery = useDeploymentChartData(
    { vehicle: vehicleName, deploymentFrom: from, from: extendedFrom, to },
    { enabled: isExtended }
  )

  const {
    data: chartData,
    isLoading,
    isError,
    error,
  } = isExtended ? deploymentQuery : latestQuery

  const charts = chartData?.filter((d) =>
    category === 'vehicle'
      ? vehicleUnits.includes(d.units.toLowerCase())
      : !vehicleUnits.includes(d.units.toLowerCase())
  )

  const cellAtIndex = (index: number) => {
    const item = charts?.[index]
    return (
      <ScienceCell
        color="#666"
        unit={item?.units ?? ''}
        title={item?.name ?? 'Data'}
        name={item?.name ?? 'Unknown'}
        values={item?.values}
        times={item?.times}
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
        <div className="absolute inset-x-0 bottom-0 z-10 h-2 bg-gradient-to-t from-stone-400/20" />
      </div>
    </>
  )
}

export default ScienceDataSection
