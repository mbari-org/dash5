import { GetEventsResponse } from '../Event/getEvents'

export interface CommsEvent extends GetEventsResponse {
  status: 'queued' | 'sent' | 'ack' | 'timeout'
  via?: 'cellsat' | 'cell' | 'sat'
  commsIsoTime?: string
  timeout?: string
  /** Mobile Terminated Message Sequence Number — Iridium ID of the command sent to the vehicle (sat comms) */
  mtmsn?: number
  /** Mobile Originated Message Sequence Number — Iridium ID of the vehicle's acknowledgment reply (sat comms) */
  momsn?: number
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

  // A timeout note is ground truth for any comms type (cell, sat, cellsat, unknown).
  // Check it first — before sbdSend state — so a timed-out command is never
  // misreported as 'sent' or 'ack' regardless of what Iridium bookkeeping exists.
  if (command.eventId) {
    const timeoutEvent = timeoutMap.get(String(command.eventId))
    if (timeoutEvent) {
      return {
        ...command,
        via,
        timeout,
        status: 'timeout',
        commsIsoTime: timeoutEvent.isoTime,
        mtmsn: undefined,
        momsn: undefined,
      }
    }
  }

  // Find sbdSend event by matching command eventId to sbdSend refId
  const matchingSbdSend = command.eventId
    ? sbdSendMap.get(String(command.eventId))
    : undefined

  if (!matchingSbdSend) {
    // If the command carries a timeout duration and that window has already
    // elapsed since it was created, treat it as timed out on the client side.
    // This covers commands that were never dispatched (no sbdSend) and for
    // which the backend may never write a timeout note.
    const timeoutMinutes = timeout ? parseInt(timeout, 10) : undefined
    const timeoutMs =
      timeoutMinutes && command.unixTime
        ? command.unixTime + timeoutMinutes * 60 * 1000
        : undefined
    if (timeoutMs && Date.now() > timeoutMs) {
      return {
        ...command,
        via,
        timeout,
        status: 'timeout',
        commsIsoTime: new Date(timeoutMs).toISOString(),
        mtmsn: undefined,
        momsn: undefined,
      }
    }
    return {
      ...command,
      via,
      timeout,
      status: 'queued',
      commsIsoTime: command.isoTime,
      mtmsn: undefined,
      momsn: undefined,
    }
  }

  // A state of 2 indicates cell comms (direct socket delivery).
  // Cell comms are considered ACKed when sent since an open socket means delivery.
  if (matchingSbdSend?.state === 2 || via === undefined) {
    // Explicitly clear mtmsn/momsn — cell comms do not carry Iridium SBD IDs.
    return {
      ...command,
      via,
      timeout,
      status: 'ack',
      commsIsoTime: matchingSbdSend.isoTime,
      mtmsn: undefined,
      momsn: undefined,
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
        // 0 is a sentinel for "no MTMSN/MOMSN" in TethysDash — normalize to undefined
        mtmsn: matchingSbdReceipt.mtmsn || undefined,
        momsn: matchingSbdReceive.momsn || undefined,
      }
    }
  }

  // Same client-side timeout inference for dispatched-but-unacknowledged commands.
  const timeoutMinutes = timeout ? parseInt(timeout, 10) : undefined
  const sentTimeoutMs =
    timeoutMinutes && matchingSbdSend.unixTime
      ? matchingSbdSend.unixTime + timeoutMinutes * 60 * 1000
      : undefined
  if (sentTimeoutMs && Date.now() > sentTimeoutMs) {
    return {
      ...command,
      via,
      timeout,
      status: 'timeout',
      commsIsoTime: new Date(sentTimeoutMs).toISOString(),
      mtmsn: matchingSbdReceipt?.mtmsn || undefined,
      momsn: undefined,
    }
  }

  return {
    ...command,
    via,
    timeout,
    status: 'sent',
    commsIsoTime: matchingSbdSend.isoTime,
    mtmsn: matchingSbdReceipt?.mtmsn || undefined,
  }
}
