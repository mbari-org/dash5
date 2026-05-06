import React, { useMemo, useState } from 'react'
import {
  EventType,
  useCommsEvents,
  useEvents,
  timeoutExpiredRegEx,
} from '@mbari/api-client'
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
  /** Additional event IDs known to be timed-out (e.g. from VehicleAccordion's
   *  badge query). CommsSection runs its own timeout-notes query internally, so
   *  this is a supplemental override rather than the primary source. */
  timedOutEventIds?: Set<number>
}

const CommsSection: React.FC<CommsSectionProps> = ({
  vehicleName,
  from,
  to,
  timedOutEventIds: externalTimedOutIds = new Set(),
}) => {
  const [deploymentLogsOnly, setDeploymentLogsOnly] = useState(true)
  const toggleDeploymentLogsOnly = () => {
    setDeploymentLogsOnly((prev) => !prev)
  }

  // Internal full-history timeout-notes query — covers all entry points
  // (CommsModal, VehicleAccordion inline) without requiring callers to pass
  // timedOutEventIds. Builds a map of eventId → timeout isoTime so the cell
  // can display the correct timestamp when overriding a stale queued/sent status.
  const timeoutNotesResponse = useEvents(
    {
      vehicles: [vehicleName],
      eventTypes: ['note'] as EventType[],
      noteMatches: 'Timeout while waiting',
      from: 1,
      limit: 500,
    },
    {
      enabled: !!vehicleName,
      staleTime: 60 * 1000,
      refetchInterval: 60 * 1000,
    }
  )

  // Map of eventId → timeout note isoTime for display-accurate timestamp override.
  const timedOutMap = useMemo(() => {
    const map = new Map<number, string>()
    timeoutNotesResponse.data?.forEach((note) => {
      const match = note.note?.match(timeoutExpiredRegEx)
      if (match) map.set(parseInt(match[1], 10), note.isoTime ?? '')
    })
    // Merge supplemental IDs from parent (no isoTime available — use empty string
    // as sentinel; the cell will fall back to the item's own commsIsoTime).
    externalTimedOutIds.forEach((id) => {
      if (!map.has(id)) map.set(id, '')
    })
    return map
  }, [timeoutNotesResponse.data, externalTimedOutIds])

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
    // Override status when the internal timeout-notes query found a timeout note
    // that useCommsEvents pagination didn't reach.
    const timeoutIsoTime =
      item?.eventId !== undefined ? timedOutMap.get(item.eventId) : undefined
    const resolvedStatus =
      timeoutIsoTime !== undefined ? 'timeout' : item?.status
    // Use the timeout note's isoTime for the cell timestamp when available;
    // fall back to the item's commsIsoTime (sent/queued time) otherwise.
    const displayIsoTime = timeoutIsoTime || item?.commsIsoTime || ''
    const commandType = item?.eventType === 'run' ? 'mission' : 'command'
    const today = DateTime.fromISO(displayIsoTime).hasSame(
      DateTime.now(),
      'day'
    )
    const day = today
      ? 'Today'
      : DateTime.fromISO(displayIsoTime).toFormat('MMM d yyyy')
    const time = DateTime.fromISO(displayIsoTime).toFormat('H:mm:ss')

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
