import React from 'react'
import { useEvents } from '@mbari/api-client'
import { AccordionCells, Virtualizer, CommsCell } from '@mbari/react-ui'
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
  const { data, isLoading, isFetching } = useEvents({
    vehicles: [vehicleName],
    eventTypes: ['command', 'run'],
    from: '',
    to: '',
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

  return (
    <AccordionCells
      cellAtIndex={cellAtIndex}
      count={data?.length}
      loading={isLoading || isFetching}
    />
  )
}

CommsSection.displayName = 'components.CommsSection'

export default CommsSection
