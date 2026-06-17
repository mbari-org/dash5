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
import { useChartData, useEvents, EventType } from '@mbari/api-client'
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

const ScienceDataSection: React.FC<{
  vehicleName: string
  from: number // milliseconds since epoch
  to?: number // milliseconds since epoch
}> = ({ vehicleName, from, to }) => {
  const { setGlobalModalId } = useGlobalModalId()

  // Fetch logPath events within this deployment to populate the logset picker.
  const { data: logPathEvents } = useEvents(
    {
      vehicles: [vehicleName],
      eventTypes: ['logPath'] as EventType[],
      from,
      to,
      limit: 200,
      ascending: 'n',
    },
    { enabled: !!vehicleName, staleTime: 5 * 60 * 1000 }
  )

  // null until logPath events load; useEffect below sets it to the latest logset.
  const [selectedLogsetId, setSelectedLogsetId] = useState<string | null>(null)

  // Auto-select the latest logset once data loads.
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

  // Resolve selected logset time window. Default to full deployment window.
  const resolvedFrom = useMemo(() => {
    if (!selectedLogsetId || !logPathEvents?.length) return from
    const idx = logPathEvents.findIndex(
      (e) => String(e.eventId) === selectedLogsetId
    )
    return idx >= 0 ? logPathEvents[idx].unixTime : from
  }, [selectedLogsetId, logPathEvents, from])

  const resolvedTo = useMemo(() => {
    if (!selectedLogsetId || !logPathEvents?.length) return to
    const idx = logPathEvents.findIndex(
      (e) => String(e.eventId) === selectedLogsetId
    )
    // List is descending (newest first), so idx-1 is the next newer logset —
    // the selected logset ends when that newer one started.
    const next = idx >= 0 ? logPathEvents[idx - 1] : undefined
    return next ? next.unixTime : to
  }, [selectedLogsetId, logPathEvents, to])

  const {
    data: chartData,
    isLoading,
    isFetching,
    isError,
    error,
  } = useChartData({
    vehicle: vehicleName,
    from: resolvedFrom,
    to: resolvedTo,
  })

  const [category, setCategory] = useState<string | null>('vehicle')
  const [logsetTooltip, setLogsetTooltip] = useState(false)

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
        {logsetOptions.length > 0 && (
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
          <AccordionCells
            cellAtIndex={cellAtIndex}
            count={charts?.length}
            loading={isLoading || isFetching}
          />
        </div>
        <div className="absolute inset-x-0 bottom-0 z-10 h-2 bg-gradient-to-t from-stone-400/20" />
      </div>
    </>
  )
}

export default ScienceDataSection
