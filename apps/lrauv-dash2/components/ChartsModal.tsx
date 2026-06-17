import { Modal, SelectField } from '@mbari/react-ui'
import { ScienceCell } from './ScienceDataSection'
import { capitalize } from '@mbari/utils'
import useCurrentDeployment from '../lib/useCurrentDeployment'
import { useChartData, useEvents, EventType } from '@mbari/api-client'
import { useState, useMemo } from 'react'
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

  const { data: logPathEvents } = useEvents(
    {
      vehicles: [vehicleName],
      eventTypes: ['logPath'] as EventType[],
      from: deploymentStartTime,
      to: deploymentEndTime,
      limit: 200,
      ascending: 'n',
    },
    { enabled: !!vehicleName, staleTime: 5 * 60 * 1000 }
  )

  const [selectedLogsetId, setSelectedLogsetId] = useState<string | null>(null)

  const logsetOptions = useMemo(() => {
    if (!logPathEvents?.length) return []
    return logPathEvents.map((e) => ({
      id: String(e.eventId),
      name: DateTime.fromMillis(e.unixTime).toFormat('MMM d, yyyy HH:mm'),
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
    const next = idx >= 0 ? logPathEvents[idx - 1] : undefined
    return next ? next.unixTime : deploymentEndTime
  }, [selectedLogsetId, logPathEvents, deploymentEndTime])

  const { data: chartData } = useChartData({
    vehicle: vehicleName,
    from: resolvedFrom,
    to: resolvedTo,
  })
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
          <SelectField
            name="logset"
            value={selectedLogsetId ?? logsetOptions[0]?.id ?? ''}
            options={logsetOptions}
            onSelect={setSelectedLogsetId}
            className="mb-2 w-full"
            label="Logset"
          />
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
