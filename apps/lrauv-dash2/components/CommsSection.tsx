import React from 'react'
import { useEvents } from '@mbari/api-client'
import { CellVirtualizer, Virtualizer, CommsCell } from '@mbari/react-ui'
import { DateTime } from 'luxon'

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
  const { data } = useEvents({
    vehicles: [vehicleName],
    eventTypes: ['command', 'run'],
    from,
    to,
  })

  const cellAtIndex = (index: number, _virtualizer: Virtualizer) => {
    const item = data?.[index]
    const isScheduled = item?.eventType === 'run'
    const diff = DateTime.fromISO(item?.isoTime ?? '').diffNow('days').days
    const day =
      Math.abs(diff) < 1
        ? 'Today'
        : DateTime.fromISO(item?.isoTime ?? '').toFormat('MMM d')
    const time = DateTime.fromISO(item?.isoTime ?? '').toFormat('H:mm')
    const handleSelection = () => {
      console.log('Do something.')
    }

    return (
      <CommsCell
        className="border-b border-slate-200"
        isScheduled={isScheduled}
        isUpload={false}
        command={item?.data ?? item?.text ?? ''}
        entry={`Mission ${item?.eventId}`}
        name={item?.user ?? ''}
        description="Waiting to transmit"
        day={day}
        time={time}
        onSelect={handleSelection}
      />
    )
  }

  return (
    <div className="relative flex h-full flex-shrink flex-grow">
      <CellVirtualizer
        cellAtIndex={cellAtIndex}
        count={data?.length ?? 0}
        className="absolute inset-0 w-full"
      />
    </div>
  )
}

CommsSection.displayName = 'components.CommsSection'

export default CommsSection
