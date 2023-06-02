import React, { useState } from 'react'
import { useEvents, useTethysApiContext } from '@mbari/api-client'
import {
  Virtualizer,
  LogCell,
  IconButton,
  MultiSelectField,
  AccordionCells,
} from '@mbari/react-ui'
import { MultiValue } from 'react-select'
import { DateTime } from 'luxon'
import formatEvent, {
  displayNameForEventType,
  eventFilters,
  isUploadEvent,
} from '../lib/formatEvent'
import {
  faSync,
  faFilter,
  faPersonRunning,
} from '@fortawesome/pro-regular-svg-icons'
import { SelectOption } from '@mbari/react-ui/dist/Fields/Select'

export interface LogsSectionProps {
  className?: string
  style?: React.CSSProperties
  vehicleName: string
  from: string
  to?: string
}

const LogsSection: React.FC<LogsSectionProps> = ({ vehicleName, from, to }) => {
  const [allLogs, setAllLogs] = useState(false)
  const toggleAllLogs = () => {
    setAllLogs((prev) => !prev)
  }

  const { siteConfig } = useTethysApiContext()
  const [filters, setFilters] = useState<MultiValue<SelectOption>>([])
  const eventTypes = filters.length
    ? filters
        .map(({ id }) => eventFilters[id].eventTypes)
        .flat()
        .filter((k, i, a) => a.indexOf(k) === i)
    : undefined

  const { data, isLoading, isFetching, refetch } = useEvents({
    vehicles: [vehicleName],
    from: allLogs ? DateTime.now().minus({ years: 2 }).toISODate() : from,
    to: allLogs ? undefined : to,
    eventTypes,
  })

  const cellAtIndex = (index: number, _virtualizer: Virtualizer) => {
    const item = data?.[index]
    const diff = DateTime.fromISO(item?.isoTime ?? '').diffNow('days').days
    const date =
      Math.abs(diff) < 1
        ? 'Today'
        : DateTime.fromISO(item?.isoTime ?? '').toFormat('yyyy-MM-dd')
    const time = DateTime.fromISO(item?.isoTime ?? '').toFormat('H:mm')

    return item ? (
      <LogCell
        className="border-b border-slate-200"
        date={date}
        time={time}
        label={displayNameForEventType(item)}
        log={formatEvent(item, siteConfig?.appConfig.external.tethysdash ?? '')}
        isUpload={isUploadEvent(item)}
      />
    ) : (
      <span />
    )
  }

  const handleRefresh = () => {
    refetch()
  }

  return (
    <>
      <header className="flex p-2">
        <MultiSelectField
          name="filters"
          value={filters}
          options={Object.keys(eventFilters).map((key) => ({
            name: key,
            id: key,
          }))}
          placeholder="Filter by event type"
          onSelect={(selection) => {
            console.log(selection)
            setFilters(selection ?? [])
          }}
          className="my-auto mr-2"
          grow
        />
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

LogsSection.displayName = 'components.LogsSection'

export default LogsSection
