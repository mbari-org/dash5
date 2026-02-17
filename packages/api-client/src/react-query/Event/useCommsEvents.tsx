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

  const { commands, sbdSendMap, sbdReceiptMap, sbdReceiveMap, timeoutMap } =
    useMemo(() => {
      const commands: GetEventsResponse[] = []
      const sbdSendMap = new Map<string, GetEventsResponse>()
      const sbdReceiptMap = new Map<string, GetEventsResponse>()
      const sbdReceiveMap = new Map<number, GetEventsResponse>()
      const timeoutMap = new Map<string, GetEventsResponse>()

      flatData.forEach((e) => {
        switch (e.eventType) {
          case 'command':
          case 'run':
            commands.push(e)
            break
          case 'sbdSend':
            if (e.refId !== undefined) sbdSendMap.set(String(e.refId), e)
            break
          case 'sbdReceipt':
            const id = e.name?.match(digitsForIdRegEx)?.[0]
            if (id) sbdReceiptMap.set(id, e)
            break
          case 'sbdReceive':
            if (e.mtmsn) sbdReceiveMap.set(e.mtmsn, e)
            break
          case 'note':
            const timeoutMatch = e.note?.match(timeoutExpiredRegEx)
            if (timeoutMatch && timeoutMatch[1]) {
              timeoutMap.set(timeoutMatch[1], e)
            }
            break
        }
      })

      return { commands, sbdSendMap, sbdReceiptMap, sbdReceiveMap, timeoutMap }
    }, [flatData])

  const [isFetchingMore, setIsFetchingMore] = useState(false)
  const [targetCommandCount, setTargetCommandCount] = useState(0)

  // If initial fetch does not have enough commands/missions, fetch more (this avoids sending back an empty array of updated commands and ui flickering during the initial load)
  const fetchingInitialCommands =
    commands.length < minCommandEvents && hasNextPage

  useEffect(() => {
    if (fetchingInitialCommands && !isLoading && !isFetchingNextPage) {
      fetchNextPage()
      return
    }
  }, [
    fetchingInitialCommands,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  ])

  // If we're manually fetching more commands, keep fetching until we have more commands (this makes sure that additional commands are fetched not just sbd/note events)
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

  const fetching = isFetching || isFetchingMore || isFetchingNextPage

  return {
    data: updatedCommands,
    isLoading: fetchingInitialCommands ? fetchingInitialCommands : isLoading,
    isFetching: fetching,
    fetchNextPage,
    hasNextPage,
    refetch,
    fetchMore,
  }
}
