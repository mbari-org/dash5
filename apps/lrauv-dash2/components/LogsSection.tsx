import React, { useMemo, useState } from 'react'
import { useEvents, useTethysApiContext } from '@mbari/api-client'
import {
  Virtualizer,
  LogCell,
  IconButton,
  MultiSelectField,
  AccordionCells,
  HistoricalListIcon,
  IconToggle,
  SubIcon,
} from '@mbari/react-ui'
import { MultiValue } from 'react-select'
import { DateTime } from 'luxon'
import clsx from 'clsx'
import formatEvent, {
  displayNameForEventType,
  eventFilters,
  isUploadEvent,
} from '../lib/formatEvent'
import { faSync } from '@fortawesome/free-solid-svg-icons'
import { SelectOption } from '@mbari/react-ui/dist/Fields/Select'
import { getAdjustedUnixTime } from '@mbari/utils'

export interface LogsSectionProps {
  className?: string
  style?: React.CSSProperties
  vehicleName: string
  from: number // milliseconds since epoch
  to?: number
  deploymentLogsOnly: boolean
  setDeploymentLogsOnly: (value: boolean) => void
}

const TWO_YEARS_AGO = getAdjustedUnixTime({
  unixTime: DateTime.now().toMillis(),
  offsetYears: -2,
})

const LogsSection: React.FC<LogsSectionProps> = ({
  vehicleName,
  from,
  to,
  deploymentLogsOnly,
  setDeploymentLogsOnly,
}) => {
  const toggleDeploymentLogsOnly = () => {
    setDeploymentLogsOnly(!deploymentLogsOnly)
  }

  const { siteConfig } = useTethysApiContext()
  const [filters, setFilters] = useState<MultiValue<SelectOption>>([])

  const eventTypes = useMemo(() => {
    return filters.length
      ? filters
          .map(({ id }) => eventFilters[id].eventTypes)
          .flat()
          .filter((k, i, a) => a.indexOf(k) === i)
      : undefined
  }, [filters])

  // Query params for deployment logs (limited to deployment timeframe)
  const deploymentQueryParams = useMemo(
    () => ({
      vehicles: [vehicleName],
      eventTypes,
      from: from,
      to: to,
      limit: 10000,
    }),
    [vehicleName, from, to, eventTypes]
  )

  // Query params for all logs (going back two years)
  const allLogsQueryParams = useMemo(
    () => ({
      vehicles: [vehicleName],
      eventTypes,
      from: TWO_YEARS_AGO,
      to: undefined,
      limit: 10000,
    }),
    [vehicleName, eventTypes]
  )

  // Two separate queries that will be cached independently
  const {
    data: deploymentLogsData,
    isLoading: isDeploymentLogsLoading,
    isFetching: isDeploymentLogsFetching,
    refetch: refetchDeploymentLogs,
  } = useEvents(deploymentQueryParams)

  const {
    data: allLogsData,
    isLoading: isAllLogsLoading,
    isFetching: isAllLogsFetching,
    refetch: refetchAllLogs,
  } = useEvents(allLogsQueryParams)

  // Use the appropriate data based on the current mode
  const data = useMemo(
    () => (deploymentLogsOnly ? deploymentLogsData : allLogsData),
    [deploymentLogsOnly, deploymentLogsData, allLogsData]
  )

  const isLoading = deploymentLogsOnly
    ? isDeploymentLogsLoading
    : isAllLogsLoading
  const isFetching = deploymentLogsOnly
    ? isDeploymentLogsFetching
    : isAllLogsFetching

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
    if (deploymentLogsOnly) {
      refetchDeploymentLogs()
    } else {
      refetchAllLogs()
    }
  }

  return (
    <>
      <header className="flex justify-between p-2">
        <MultiSelectField
          name="filters"
          value={filters}
          options={Object.keys(eventFilters).map((key) => ({
            name: key,
            id: key,
          }))}
          placeholder="Filter by event type"
          onSelect={(selection) => {
            setFilters(selection ?? [])
          }}
          className="my-auto mr-2 max-w-xs"
          grow
        />
        <div className="flex items-center">
          <IconToggle
            iconLeft={
              <HistoricalListIcon
                className={clsx(
                  'transition-colors duration-300',
                  deploymentLogsOnly ? 'text-gray-400' : 'text-black'
                )}
              />
            }
            iconRight={
              <SubIcon
                className={clsx(
                  'transition-colors duration-300',
                  deploymentLogsOnly ? 'text-black' : 'text-gray-400'
                )}
              />
            }
            isToggled={deploymentLogsOnly}
            onToggle={toggleDeploymentLogsOnly}
            tooltip={
              deploymentLogsOnly
                ? 'Displaying deployment logs'
                : 'Displaying all logs'
            }
            tooltipAlignment="right"
            ariaLabelLeft="Displaying all logs"
            ariaLabelRight="Displaying deployment logs"
            className="mr-4"
          />
          <IconButton
            icon={faSync}
            ariaLabel="reload"
            tooltipAlignment="right"
            tooltip="Refresh logs"
            disabled={isLoading || isFetching}
            onClick={handleRefresh}
            size="text-md"
            iconClassName="text-xl"
            className="flex items-center justify-center rounded-full border-2 border-blue-400 text-blue-400"
          />
        </div>
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
