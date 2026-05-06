import React, { useMemo, useState } from 'react'
import { EventType, useCommsEvents } from '@mbari/api-client'
import {
  AccordionCells,
  Virtualizer,
  CommsCell,
  LoadMoreButton,
  LogsToolbar,
} from '@mbari/react-ui'
import { DateTime } from 'luxon'

export interface CommsSectionProps {
  className?: string
  style?: React.CSSProperties
  vehicleName: string
  from: number // milliseconds since epoch
  to?: number // milliseconds since epoch
  /** Event IDs confirmed timed-out via the dedicated full-history notes query.
   *  Overrides the status derived from useCommsEvents pagination, which may not
   *  have fetched the timeout note for older commands. */
  timedOutEventIds?: Set<number>
}

const CommsSection: React.FC<CommsSectionProps> = ({
  vehicleName,
  from,
  to,
  timedOutEventIds = new Set(),
}) => {
  const [deploymentLogsOnly, setDeploymentLogsOnly] = useState(true)
  const toggleDeploymentLogsOnly = () => {
    setDeploymentLogsOnly((prev) => !prev)
  }

  const deploymentParams = useMemo(
    () => ({
      vehicles: [vehicleName],
      eventTypes: ['command', 'run'] as EventType[],
      from,
      to,
      limit: 500,
    }),
    [vehicleName, from, to]
  )

  const deploymentResponse = useCommsEvents(deploymentParams)

  const allLogsParams = useMemo(
    () => ({
      vehicles: [vehicleName],
      eventTypes: ['command', 'run'] as EventType[],
      from: 0,
      limit: 500,
    }),
    [vehicleName]
  )

  const allLogsResponse = useCommsEvents(allLogsParams)

  const {
    data = [],
    isLoading,
    isFetching,
    hasNextPage,
    refetch,
    fetchMore,
  } = deploymentLogsOnly ? deploymentResponse : allLogsResponse

  const dataCount = data?.length ?? 0
  const totalCount = hasNextPage ? dataCount + 1 : dataCount

  const handleLoadMore = () => {
    fetchMore()
  }

  const cellAtIndex = (index: number, _virtualizer: Virtualizer) => {
    if (hasNextPage && dataCount && index === dataCount) {
      return (
        <LoadMoreButton
          onClick={handleLoadMore}
          isLoading={isFetching}
          label="Load more logs"
        />
      )
    }

    const item = data[index]
    // Override status when the dedicated full-history notes query found a
    // timeout note that useCommsEvents pagination didn't reach.
    const resolvedStatus =
      item?.eventId !== undefined && timedOutEventIds.has(item.eventId)
        ? 'timeout'
        : item?.status
    const commandType = item?.eventType === 'run' ? 'mission' : 'command'
    const today = DateTime.fromISO(item?.commsIsoTime ?? '').hasSame(
      DateTime.now(),
      'day'
    )
    const day = today
      ? 'Today'
      : DateTime.fromISO(item?.commsIsoTime ?? '').toFormat('MMM d yyyy')
    const time = DateTime.fromISO(item?.commsIsoTime ?? '').toFormat('H:mm:ss')

    return item ? (
      <CommsCell
        className="border-b border-slate-200"
        commandType={commandType}
        status={resolvedStatus}
        command={item?.data ?? item?.text ?? ''}
        entry={`Mission ${item?.eventId}`}
        name={item?.user ?? ''}
        via={item?.via}
        vehicleName={vehicleName}
        timeout={item?.timeout}
        day={day}
        time={time}
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
      <header className="flex justify-end p-2">
        <LogsToolbar
          deploymentLogsOnly={deploymentLogsOnly}
          toggleDeploymentLogsOnly={toggleDeploymentLogsOnly}
          disabled={isLoading || isFetching}
          handleRefresh={handleRefresh}
        />
      </header>
      <AccordionCells
        cellAtIndex={cellAtIndex}
        count={totalCount}
        loading={isLoading || isFetching}
      />
    </>
  )
}

CommsSection.displayName = 'components.CommsSection'

export default CommsSection
