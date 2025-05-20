import { useMemo } from 'react'
import {
  EventType,
  GetEventsResponse,
  useInfiniteEvents,
} from '@mbari/api-client'

interface CommsEvent extends GetEventsResponse {
  status: 'queued' | 'sent' | 'ack'
  via?: 'cellsat' | 'cell' | 'sat'
  commsIsoTime?: string
  timeout?: string
}

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
      eventTypes: ['command', 'run', 'sbdSend', 'sbdReceipt'] as EventType[],
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

  // Memoize filtered data
  const { commands, sbdSends, sbdReceipts } = useMemo(() => {
    const commands = flatData.filter(
      (e) => e.eventType === 'command' || e.eventType === 'run'
    )
    const sbdSends = flatData.filter((e) => e.eventType === 'sbdSend')
    const sbdReceipts = flatData.filter((e) => e.eventType === 'sbdReceipt')

    return { commands, sbdSends, sbdReceipts }
  }, [flatData])

  const sbdSendMap = useMemo(() => {
    const map = new Map<string, GetEventsResponse>()
    sbdSends.forEach((send) => {
      if (send.refId) {
        map.set(String(send.refId), send)
      }
    })
    return map
  }, [sbdSends])

  const sbdReceiptMap = useMemo(() => {
    const map = new Map<string, GetEventsResponse>()
    sbdReceipts.forEach((receipt) => {
      const eventIdMatch = receipt.name?.match(/(\d+)/)
      if (eventIdMatch && eventIdMatch[1]) {
        map.set(eventIdMatch[1], receipt)
      }
    })
    return map
  }, [sbdReceipts])

  const updatedCommands = useMemo((): CommsEvent[] => {
    return commands.map((command) => {
      const via = command.note?.includes('cellsat')
        ? 'cellsat'
        : command.note?.includes('cell,')
        ? 'cell'
        : command.note?.includes('sat]')
        ? 'sat'
        : undefined

      const timeout = command.note
        ? (command.note.match(/timeout:(\d+)min/) || [])[1]
        : undefined

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

      if (
        matchingSbdSend &&
        (matchingSbdSend?.state === 2 || via === undefined)
      ) {
        // Cells comms are considered ACKed if they are sent
        return {
          ...command,
          via,
          timeout,
          status: 'ack',
          commsIsoTime: matchingSbdSend.isoTime,
        }
      }

      const matchingSbdReceipt = matchingSbdSend.eventId
        ? sbdReceiptMap.get(String(matchingSbdSend.eventId))
        : undefined

      if (matchingSbdReceipt && matchingSbdReceipt.mtmsn !== 0) {
        // Sat comms are considered ACKed if they have a receipt
        return {
          ...command,
          via,
          timeout,
          status: 'ack',
          commsIsoTime: matchingSbdReceipt.isoTime,
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
  }, [commands, sbdSendMap, sbdReceiptMap])

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
