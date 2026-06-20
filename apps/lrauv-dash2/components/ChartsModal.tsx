import { Modal, SelectField, ToolTip } from '@mbari/react-ui'
import { ScienceCell } from './ScienceDataSection'
import { capitalize } from '@mbari/utils'
import useCurrentDeployment from '../lib/useCurrentDeployment'
import { useChartData, useEvents, EventType } from '@mbari/api-client'
import { useState, useMemo, useEffect } from 'react'
import { DateTime } from 'luxon'

export interface ChartsModalProps {
  vehicleName: string
  className?: string
  style?: React.CSSProperties
  onClose?: () => void
}

export const ChartsModal: React.FC<ChartsModalProps> = ({
  vehicleName,
  className,
  style,
  onClose,
}) => {
  const { deployment } = useCurrentDeployment()
  const deploymentStartTime = deployment?.startEvent?.unixTime ?? 0
  const deploymentEndTime = deployment?.endEvent?.unixTime

  const { data: logPathEvents, isError: logPathError } = useEvents(
    {
      vehicles: [vehicleName],
      eventTypes: ['logPath'] as EventType[],
      from: deploymentStartTime,
      to: deploymentEndTime,
      limit: 200,
      ascending: 'n',
    },
    {
      enabled: !!vehicleName && deploymentStartTime > 0,
      staleTime: 5 * 60 * 1000,
    }
  )

  const [selectedLogsetId, setSelectedLogsetId] = useState<string | null>(null)
  const [logsetTooltip, setLogsetTooltip] = useState(false)

  // Auto-select the latest logset; also reset if the current ID is no longer
  // valid (e.g. vehicle/deployment changed while the modal stayed open).
  useEffect(() => {
    if (logPathEvents?.length) {
      const validIds = new Set(logPathEvents.map((e) => String(e.eventId)))
      if (!selectedLogsetId || !validIds.has(selectedLogsetId)) {
        setSelectedLogsetId(String(logPathEvents[0].eventId))
      }
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

  const resolvedFrom = useMemo(() => {
    if (!selectedLogsetId || !logPathEvents?.length) return deploymentStartTime
    const idx = logPathEvents.findIndex(
      (e) => String(e.eventId) === selectedLogsetId
    )
    return idx >= 0 ? logPathEvents[idx].unixTime : deploymentStartTime
  }, [selectedLogsetId, logPathEvents, deploymentStartTime])

  const resolvedTo = useMemo(() => {
    if (!selectedLogsetId || !logPathEvents?.length) return deploymentEndTime
    const idx = logPathEvents.findIndex(
      (e) => String(e.eventId) === selectedLogsetId
    )
    // List is descending (newest first), so idx-1 is the next newer logset.
    const next = idx >= 0 ? logPathEvents[idx - 1] : undefined
    return next ? next.unixTime : deploymentEndTime
  }, [selectedLogsetId, logPathEvents, deploymentEndTime])

  // Wait until logsets are loaded (or confirmed absent/errored) and a logset
  // is selected before firing the chart query. This prevents a wasted fetch
  // with the fallback window followed by a refetch once logset auto-selection
  // runs. On error we treat logsets as unavailable so charts still render
  // using the fallback deployment window rather than staying permanently blank.
  const logsetReady =
    logPathError ||
    (logPathEvents !== undefined &&
      (logPathEvents.length === 0 || selectedLogsetId !== null))

  const { data: chartData } = useChartData(
    {
      vehicle: vehicleName,
      from: resolvedFrom,
      to: resolvedTo,
    },
    { enabled: resolvedFrom > 0 && logsetReady }
  )
  const [chart, setChart] = useState<string | null>(null)
  const data = chartData?.find((c) => c.name === chart)
  return (
    <Modal
      className={className}
      style={{
        minHeight: '85vh',
        ...style,
      }}
      title={`Rendering science and data charts for ${capitalize(
        vehicleName ?? ''
      )}`}
      onClose={onClose}
      maximized
      open
    >
      <div className="flex gap-2">
        {logsetOptions.length > 0 && (
          <div
            className="relative mb-2 w-full"
            onMouseEnter={() => setLogsetTooltip(true)}
            onMouseLeave={() => setLogsetTooltip(false)}
          >
            <SelectField
              name="logset"
              placeholder="Logset"
              value={selectedLogsetId ?? ''}
              options={logsetOptions}
              onSelect={setSelectedLogsetId}
              className="w-full"
            />
            <ToolTip
              label="Select a logset to scope the charts to that time window"
              direction="below"
              active={logsetTooltip}
            />
          </div>
        )}
        <SelectField
          name="Chart"
          value={chart ?? ''}
          options={chartData?.map((c) => ({ id: c.name, name: c.name })) ?? []}
          onSelect={setChart}
          className="mb-2 w-full"
        />
      </div>
      <div className="flex flex-grow flex-col">
        {data ? (
          <ScienceCell
            color="#666"
            unit={data?.units ?? ''}
            title={data?.name ?? 'Data'}
            name={data?.name ?? 'Unknown'}
            values={data?.values}
            times={data?.times}
            chartHeightClassname="h-[65vh]"
            timeout={0}
          />
        ) : (
          <p className="my-auto text-center font-bold text-stone-600">
            Choose a data set from above...
          </p>
        )}
      </div>
    </Modal>
  )
}
