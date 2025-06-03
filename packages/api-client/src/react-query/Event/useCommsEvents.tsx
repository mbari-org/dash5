import { useMemo, useEffect, useCallback, useState } from 'react'
import {
  determineCommandStatus,
  CommsEvent,
  digitsForIdRegEx,
  timeoutExpiredRegEx,
  GetEventsResponse,
  EventType,
} from '../../axios'
import { useInfiniteEvents } from './useInfiniteEvents'

const minCommandEvents = 10

export const useCommsEvents = ({
  vehicles,
  from,
  to,
  limit = 500,
}: {
  vehicles: string[]
  from: number
  to?: number
  limit?: number
}) => {
  const params = useMemo(
    () => ({
      vehicles,
      eventTypes: [
        'command',
        'run',
        'sbdSend',
        'sbdReceipt',
        'sbdReceive',
        'note',
      ] as EventType[],
      from,
      to,
      limit,
    }),
    [vehicles, from, to, limit]
  )

  const {
    data,
    isLoading,
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    refetch,
  } = useInfiniteEvents(params)

  const flatData = useMemo(() => {
    if (!data?.pages) return []
    return data.pages.flat()
  }, [data?.pages])

  const commands = useMemo(() => {
    const commands: GetEventsResponse[] = []
    flatData.forEach((e) => {
      if (e.eventType === 'command' || e.eventType === 'run') {
        commands.push(e)
      }
    })
    return commands
  }, [flatData])

  const [isFetchingMore, setIsFetchingMore] = useState(false)
  const [targetCommandCount, setTargetCommandCount] = useState(0)

  // If initial fetch does not have enough commands/missions, fetch more (this avoids sending back an empty array of updated commands)
  useEffect(() => {
    if (!isLoading && !isFetchingNextPage && !isFetchingMore && hasNextPage) {
      if (commands.length < minCommandEvents) {
        fetchNextPage()
      }
    }
  }, [
    commands.length,
    fetchNextPage,
    hasNextPage,
    isFetchingMore,
    isFetchingNextPage,
    isLoading,
  ])

  // If we're manually fetching more commands, keep fetching until we have more commands (this makes sure that additional commands are fetched and not just other types of events)
  useEffect(() => {
    if (isFetchingMore) {
      if (
        !isLoading &&
        !isFetchingNextPage &&
        hasNextPage &&
        commands.length < targetCommandCount
      ) {
        fetchNextPage()
        return
      }

      if (
        !hasNextPage ||
        commands.length >= targetCommandCount ||
        (!isLoading && !isFetchingNextPage)
      ) {
        setIsFetchingMore(false)
      }
    }
  }, [
    commands.length,
    fetchNextPage,
    hasNextPage,
    isFetchingMore,
    isFetchingNextPage,
    isLoading,
    targetCommandCount,
  ])

  const fetchMore = useCallback(async () => {
    if (isLoading || isFetchingNextPage || isFetchingMore) return

    if (hasNextPage) {
      setTargetCommandCount(commands.length + minCommandEvents)
      setIsFetchingMore(true)
    }
  }, [
    commands.length,
    hasNextPage,
    isLoading,
    isFetchingNextPage,
    isFetchingMore,
  ])

  const sbdSendMap = useMemo(() => {
    const map = new Map<string, GetEventsResponse>()
    flatData.forEach((e) => {
      if (e.eventType === 'sbdSend' && e.refId !== undefined) {
        map.set(String(e.refId), e)
      }
    })
    return map
  }, [flatData])

  const sbdReceiptMap = useMemo(() => {
    const map = new Map<string, GetEventsResponse>()
    flatData.forEach((e) => {
      if (e.eventType === 'sbdReceipt') {
        const id = e.name?.match(digitsForIdRegEx)?.[0]
        if (id) map.set(id, e)
      }
    })
    return map
  }, [flatData])

  const sbdReceiveMap = useMemo(() => {
    const map = new Map<number, GetEventsResponse>()
    flatData.forEach((e) => {
      if (e.eventType === 'sbdReceive' && e.mtmsn) {
        map.set(e.mtmsn, e)
      }
    })
    return map
  }, [flatData])

  const timeoutMap = useMemo(() => {
    const map = new Map<string, GetEventsResponse>()
    flatData.forEach((e) => {
      if (e.eventType === 'note') {
        const timeoutMatch = e.note?.match(timeoutExpiredRegEx)
        if (timeoutMatch && timeoutMatch[1]) {
          map.set(timeoutMatch[1], e)
        }
      }
    })
    return map
  }, [flatData])

  const updatedCommands = useMemo((): CommsEvent[] => {
    return commands.map((command) => {
      return determineCommandStatus(
        command,
        sbdSendMap,
        sbdReceiptMap,
        sbdReceiveMap,
        timeoutMap
      )
    })
  }, [commands, sbdSendMap, sbdReceiptMap, sbdReceiveMap, timeoutMap])

  return {
    data: updatedCommands,
    isLoading,
    isFetching: isFetching || isFetchingMore || isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    refetch,
    fetchMore,
  }
}
