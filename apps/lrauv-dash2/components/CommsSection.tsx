import React, { useMemo, useState } from 'react'
import { EventType, useInfiniteEvents } from '@mbari/api-client'
import {
  AccordionCells,
  Virtualizer,
  CommsCell,
  LoadMoreButton,
  LogsToolbar,
} from '@mbari/react-ui'
import { DateTime } from 'luxon'
import { useLastCommsTime } from '../lib/useLastCommsTime'

export interface CommsSectionProps {
  className?: string
  style?: React.CSSProperties
  vehicleName: string
  from: number // milliseconds since epoch
  to?: number // milliseconds since epoch
}

const CommsSection: React.FC<CommsSectionProps> = ({
  vehicleName,
  from,
  to,
}) => {
  const [deploymentLogsOnly, setDeploymentLogsOnly] = useState(false)
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

  const deploymentResponse = useInfiniteEvents(deploymentParams)

  const allLogsParams = useMemo(
    () => ({
      vehicles: [vehicleName],
      eventTypes: ['command', 'run'] as EventType[],
      from: 0,
      limit: 500,
    }),
    [vehicleName]
  )

  const allLogsResponse = useInfiniteEvents(allLogsParams)

  const {
    data,
    isLoading,
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    refetch,
  } = deploymentLogsOnly ? deploymentResponse : allLogsResponse

  const flatData = useMemo(() => {
    if (!data?.pages) return []
    return data.pages.flat()
  }, [data?.pages])
  const dataCount = flatData?.length ?? 0
  const totalCount = hasNextPage ? dataCount + 1 : dataCount

  const handleLoadMore = () => {
    fetchNextPage()
  }
  const lastCommsMillis = useLastCommsTime(vehicleName, from)

  const cellAtIndex = (index: number, _virtualizer: Virtualizer) => {
    if (hasNextPage && index === dataCount) {
      return (
        <LoadMoreButton
          onClick={handleLoadMore}
          isLoading={isFetchingNextPage}
          label="Load more logs"
        />
      )
    }

    const item = flatData[index]
    const isScheduled = item?.eventType === 'run'
    const today =
      DateTime.fromISO(item?.isoTime ?? '').day === DateTime.now().day
    const day = today
      ? 'Today'
      : DateTime.fromISO(item?.isoTime ?? '').toFormat('MMM d yyyy')
    const time = DateTime.fromISO(item?.isoTime ?? '').toFormat('H:mm')
    const occurredSinceLastComms =
      (item?.unixTime ?? DateTime.now().toMillis()) > (lastCommsMillis ?? 0)

    return item ? (
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
