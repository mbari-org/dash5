import React, { useState } from 'react'
import { useEvents } from '@mbari/api-client'
import {
  AccordionCells,
  Virtualizer,
  CommsCell,
  IconButton,
} from '@mbari/react-ui'
import {
  faFilter,
  faPersonRunning,
  faSync,
} from '@fortawesome/free-solid-svg-icons'
import { DateTime } from 'luxon'
import { useLastCommsTime } from '../lib/useLastCommsTime'

export interface CommsSectionProps {
  className?: string
  style?: React.CSSProperties
  vehicleName: string
  from: string
  to?: string
}

const CommsSection: React.FC<CommsSectionProps> = ({
  vehicleName,
  from,
  to,
}) => {
  const [allLogs, setAllLogs] = useState(false)
  const toggleAllLogs = () => {
    setAllLogs((prev) => !prev)
  }

  const { data, isLoading, isFetching, refetch } = useEvents({
    vehicles: [vehicleName],
    eventTypes: ['command', 'run'],
    from: allLogs ? DateTime.now().minus({ years: 2 }).toISODate() : from,
    to: allLogs ? undefined : to,
  })
  const lastCommsMillis = useLastCommsTime(
    vehicleName,
    DateTime.fromISO(from).toMillis()
  )

  const cellAtIndex = (index: number, _virtualizer: Virtualizer) => {
    const item = data?.[index]
    const isScheduled = item?.eventType === 'run'
    const today =
      DateTime.fromISO(item?.isoTime ?? '').day === DateTime.now().day
    const day = today
      ? 'Today'
      : DateTime.fromISO(item?.isoTime ?? '').toFormat('MMM d')
    const time = DateTime.fromISO(item?.isoTime ?? '').toFormat('H:mm')
    const occurredSinceLastComms =
      (item?.unixTime ?? DateTime.now().toMillis()) > (lastCommsMillis ?? 0)

    return (
      <CommsCell
        className="border-b border-slate-200"
        isScheduled={isScheduled}
        isUpload={occurredSinceLastComms}
        command={item?.data ?? item?.text ?? ''}
        entry={`Mission ${item?.eventId}`}
        name={item?.user ?? ''}
        description={
          occurredSinceLastComms
            ? 'Waiting to transmit'
            : `Ack by ${vehicleName}`
        }
        day={day}
        time={time}
      />
    )
  }

  const handleRefresh = () => {
    refetch()
  }

  return (
    <>
      <header className="flex justify-end p-2">
        <IconButton
          icon={faSync}
          ariaLabel="reload"
          tooltipAlignment="right"
          tooltip="Reload"
          className="my-auto"
          disabled={isLoading || isFetching}
          onClick={handleRefresh}
        />
        <IconButton
          icon={!allLogs ? faFilter : faPersonRunning}
          ariaLabel="download"
          tooltipAlignment="right"
          tooltip={!allLogs ? 'Historic Logs' : 'Realtime'}
          className="my-auto"
          onClick={toggleAllLogs}
        />
      </header>
      <AccordionCells
        cellAtIndex={cellAtIndex}
        count={data?.length}
        loading={isLoading || isFetching}
      />
    </>
  )
}

CommsSection.displayName = 'components.CommsSection'

export default CommsSection
