import { GetEventsResponse } from '../Event/getEvents'

export interface CommsEvent extends GetEventsResponse {
  status: 'queued' | 'sent' | 'ack' | 'timeout'
  via?: 'cellsat' | 'cell' | 'sat'
  commsIsoTime?: string
  timeout?: string
}

export const digitsForIdRegEx = /\d+/
export const timeoutRegEx = /timeout:(\d+)min/
export const timeoutExpiredRegEx = /id=(\d+):\s*Timeout while waiting/
export const viaRegEx = /via:\s*(cellsat|cell|sat)(?:,|\])/

export const getVia = (note?: string) =>
  note?.match(viaRegEx)?.[1] as 'cellsat' | 'cell' | 'sat' | undefined

export const determineCommandStatus = (
  command: GetEventsResponse,
  sbdSendMap: Map<string, GetEventsResponse>,
  sbdReceiptMap: Map<string, GetEventsResponse>,
  sbdReceiveMap: Map<number, GetEventsResponse>,
  timeoutMap: Map<string, GetEventsResponse>
): CommsEvent => {
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
  if (matchingSbdSend && (matchingSbdSend?.state === 2 || via === undefined)) {
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
}
