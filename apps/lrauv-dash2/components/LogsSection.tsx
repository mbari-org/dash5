import React from 'react'
import { useEvents, useTethysApiContext } from '@mbari/api-client'
import { CellVirtualizer, Virtualizer, LogCell } from '@mbari/react-ui'
import { DateTime } from 'luxon'
import formatEvent, { displayNameForEventType } from '../lib/formatEvent'

export interface LogsSectionProps {
  className?: string
  style?: React.CSSProperties
  vehicleName: string
  from: string
  to?: string
}

const LogsSection: React.FC<LogsSectionProps> = ({ vehicleName, from, to }) => {
  const { siteConfig } = useTethysApiContext()
  const { data } = useEvents({
    vehicles: [vehicleName],
    from,
    to,
  })

  const cellAtIndex = (index: number, _virtualizer: Virtualizer) => {
    const item = data?.[index]
    const diff = DateTime.fromISO(item?.isoTime ?? '').diffNow('days').days
    const date =
      Math.abs(diff) < 1
        ? 'Today'
        : DateTime.fromISO(item?.isoTime ?? '').toFormat('yyyy-MM-dd')
    const time = DateTime.fromISO(item?.isoTime ?? '').toFormat('H:mm')
    const handleSelection = () => {
      console.log('Do something.')
    }

    return item ? (
      <LogCell
        className="border-b border-slate-200"
        date={date}
        time={time}
        onSelect={handleSelection}
        label={displayNameForEventType(item)}
        log={formatEvent(item, siteConfig?.appConfig.external.tethysdash ?? '')}
        isUpload
      />
    ) : (
      <span />
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

LogsSection.displayName = 'components.LogsSection'

export default LogsSection
