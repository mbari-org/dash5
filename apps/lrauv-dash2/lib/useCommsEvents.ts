import { useMemo } from 'react'
import {
  EventType,
  GetEventsResponse,
  useInfiniteEvents,
} from '@mbari/api-client'

interface CommsEvent extends GetEventsResponse {
  status: 'queued' | 'sent' | 'ack' | 'timeout'
  via?: 'cellsat' | 'cell' | 'sat'
  commsIsoTime?: string
  timeout?: string
}

const digitsForIdRegEx = /\d+/
const timeoutRegEx = /timeout:(\d+)min/
const timeoutExpiredRegEx = /id=(\d+):\s*Timeout while waiting/

const viaRegEx = /via:\s*(cellsat|cell|sat)(?:,|\])/

const getVia = (note?: string) =>
  note?.match(viaRegEx)?.[1] as 'cellsat' | 'cell' | 'sat' | undefined

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

  const updatedCommands = useMemo((): CommsEvent[] => {
    return commands.map((command) => {
      const via = getVia(command.note)

      const timeout = command.note
        ? (command.note.match(timeoutRegEx) || [])[1]
        : undefined

      // Check if the cell comm has timed out by looking for a timeout note event with command eventId
      if (command.eventId && timeout && via === 'cell') {
        const timeoutEvent = timeoutMap.get(String(command.eventId))
        if (timeoutEvent) {
          return {
            ...command,
            via,
            timeout,
            status: 'timeout',
            commsIsoTime: timeoutEvent.isoTime,
          }
        }
      }

      // Find sbdSend event by matching command eventId to sbdSend refId
      const matchingSbdSend = command.eventId
        ? sbdSendMap.get(String(command.eventId))
        : undefined

      if (!matchingSbdSend) {
        return {
          ...command,
          via,
          timeout,
          status: 'queued',
          commsIsoTime: command.isoTime,
        }
      }

      // A state of 2 indicates cell comms, aka direct comms in dash4
      // Cells comms are considered ACKed if they are sent since that indicates the socket is open
      if (
        matchingSbdSend &&
        (matchingSbdSend?.state === 2 || via === undefined)
      ) {
        return {
          ...command,
          via,
          timeout,
          status: 'ack',
          commsIsoTime: matchingSbdSend.isoTime,
        }
      }

      // Find sbdReceipt event by matching sbdSend eventId to part of sbdReceipt name
      const matchingSbdReceipt = matchingSbdSend.eventId
        ? sbdReceiptMap.get(String(matchingSbdSend.eventId))
        : undefined

      // Check for matching sbdReceive with the same mtmsn as the receipt
      if (matchingSbdReceipt && matchingSbdReceipt.mtmsn !== 0) {
        const matchingSbdReceive = matchingSbdReceipt.mtmsn
          ? sbdReceiveMap.get(matchingSbdReceipt.mtmsn)
          : undefined

        // Sat comms are considered ACKed if they have a matching sbdReceive with the same mtmsn as the receipt
        if (matchingSbdReceive) {
          return {
            ...command,
            via,
            timeout,
            status: 'ack',
            commsIsoTime: matchingSbdReceive.isoTime,
          }
        }
      }

      return {
        ...command,
        via,
        timeout,
        status: 'sent',
        commsIsoTime: matchingSbdSend.isoTime,
      }
    })
  }, [commands, sbdSendMap, sbdReceiptMap, sbdReceiveMap, timeoutMap])

  return {
    data: updatedCommands,
    isLoading,
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    refetch,
  }
}
